-- =====================================================================
-- MYTHARA · RPG · Migration 029: Helden-Skins (anderes Aussehen für einen Helden, beim Händler für Seelensplitter)
-- =====================================================================
-- Voraussetzung: Migrationen 006 (Heldensammlung) und 008 (Seelensplitter, Arena) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) rpg_skin_items: der Katalog. Jeder Skin gehört zu genau einem Helden und hat einen Preis.
--      Die ersten Skins: berserker_wolfsblut (Ragnar, „Wolfsblut“), assassine_rabenschatten (Vex, „Rabenschatten“)
--      und gelehrter_sternenkunde (Lyra, „Sternenkunde“), je 650 Seelensplitter.
--   2) rpg_skin_owned: wer welchen Skin besitzt. rpg_skin_equipped: welchen Skin ein Konto je Held trägt.
--   3) rpg_skins(): Katalog mit Besitz, Kontostand und den angelegten Skins.
--      rpg_skin_buy(Skin): kaufen – nur mit Spielerkonto, nur wenn man den Helden besitzt, nur einmal.
--      rpg_skin_equip(Held, Skin): anlegen; Skin = null stellt auf das normale Aussehen zurück.
--   4) rpg_arena_skins(Kampf): die angelegten Skins beider Teams – nur für die Teilnehmer des Kampfes,
--      damit jeder den Skin des Gegners sieht.
-- Skins ändern nur das Aussehen. Werte, Fähigkeiten und Kämpfe bleiben unberührt.
--
-- Einen weiteren Skin legt später eine Zeile im Katalog an (insert into rpg_skin_items …) plus die Bilder im Spiel.
--
-- NUR FÜR DAS RPG. Rückbau: 029_rpg_skins_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_hero_collection') is null or to_regclass('public.rpg_hero_catalog') is null or to_regprocedure('public.rpg_sammlung_konto()') is null then raise exception 'Migration 006 (Heldensammlung) fehlt.'; end if;
  if to_regclass('public.rpg_wallet') is null or to_regclass('public.rpg_arena_matches') is null then raise exception 'Migration 008 (Seelensplitter, Arena) fehlt.'; end if;
end $$;

-- ---------------------------------------------------------------------
-- 1) Tabellen
-- ---------------------------------------------------------------------
create table if not exists public.rpg_skin_items (
  id       text     primary key check (id ~ '^[a-z][a-z0-9_]{1,40}$'),
  hero_id  text     not null references public.rpg_hero_catalog(hero_id),
  preis    integer  not null check (preis >= 0),
  reihe    integer  not null default 0,
  aktiv    boolean  not null default true      -- false: nicht mehr zu kaufen; wer ihn hat, behält ihn
);
create table if not exists public.rpg_skin_owned (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  skin_id     text        not null references public.rpg_skin_items(id),
  preis       integer     not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, skin_id)
);
create table if not exists public.rpg_skin_equipped (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  hero_id     text        not null,
  skin_id     text        not null references public.rpg_skin_items(id),
  updated_at  timestamptz not null default now(),
  primary key (user_id, hero_id)
);
alter table public.rpg_skin_items    enable row level security;
alter table public.rpg_skin_owned    enable row level security;
alter table public.rpg_skin_equipped enable row level security;
revoke all on public.rpg_skin_items, public.rpg_skin_owned, public.rpg_skin_equipped from anon, authenticated;

insert into public.rpg_skin_items (id, hero_id, preis, reihe) values ('berserker_wolfsblut', 'berserker', 650, 10), ('assassine_rabenschatten', 'assassine', 650, 20), ('gelehrter_sternenkunde', 'gelehrter', 650, 30)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2) Katalog, Besitz und angelegte Skins
-- ---------------------------------------------------------------------
create or replace function public.rpg_skins()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_sammlung_konto() then return jsonb_build_object('konto', false); end if;
  return jsonb_build_object('konto', true,
    'waehrung', coalesce((select betrag from public.rpg_wallet where user_id = v_uid), 0),
    'katalog', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'held', i.hero_id, 'preis', i.preis,
        'besitzt', exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = i.id),
        'hat_held', exists (select 1 from public.rpg_hero_collection c where c.user_id = v_uid and c.hero_id = i.hero_id)) order by i.reihe, i.id)
      from public.rpg_skin_items i where i.aktiv or exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = i.id)), '[]'::jsonb),
    'aktiv', coalesce((select jsonb_object_agg(e.hero_id, e.skin_id) from public.rpg_skin_equipped e where e.user_id = v_uid), '{}'::jsonb));
end;
$$;

-- Kaufen: Preis aus dem Katalog; nur wer den Helden besitzt; jeder Skin nur einmal
create or replace function public.rpg_skin_buy(p_id text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_i public.rpg_skin_items%rowtype;
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Der Händler handelt nur mit Spielerkonten.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_shop:' || v_uid::text));
  select * into v_i from public.rpg_skin_items where id = p_id and aktiv;
  if not found then raise exception 'Das führt der Händler nicht.'; end if;
  if exists (select 1 from public.rpg_skin_owned where user_id = v_uid and skin_id = p_id) then raise exception 'Diesen Skin besitzt du schon.'; end if;
  if not exists (select 1 from public.rpg_hero_collection where user_id = v_uid and hero_id = v_i.hero_id) then raise exception 'Diesen Helden hast du noch nicht.'; end if;
  if v_i.preis > 0 then
    update public.rpg_wallet set betrag = betrag - v_i.preis, updated_at = now() where user_id = v_uid and betrag >= v_i.preis;
    if not found then raise exception 'Dafür reichen deine Seelensplitter nicht.'; end if;
  end if;
  insert into public.rpg_skin_owned (user_id, skin_id, preis) values (v_uid, p_id, v_i.preis);
  return public.rpg_skins();
end;
$$;

-- Anlegen: p_skin = null stellt den Helden auf sein normales Aussehen zurück
create or replace function public.rpg_skin_equip(p_held text, p_skin text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Skins gibt es nur mit einem Spielerkonto.'; end if;
  if p_skin is null then
    delete from public.rpg_skin_equipped where user_id = v_uid and hero_id = p_held;
  else
    if not exists (select 1 from public.rpg_skin_items i join public.rpg_skin_owned o on o.skin_id = i.id and o.user_id = v_uid where i.id = p_skin and i.hero_id = p_held) then
      raise exception 'Diesen Skin besitzt du nicht für diesen Helden.';
    end if;
    insert into public.rpg_skin_equipped (user_id, hero_id, skin_id) values (v_uid, p_held, p_skin)
      on conflict (user_id, hero_id) do update set skin_id = excluded.skin_id, updated_at = now();
  end if;
  return public.rpg_skins();
end;
$$;

-- ---------------------------------------------------------------------
-- 3) Arena: die angelegten Skins beider Teams – nur für die Teilnehmer
-- ---------------------------------------------------------------------
create or replace function public.rpg_skins_von(p_user uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_object_agg(e.hero_id, e.skin_id) from public.rpg_skin_equipped e where e.user_id = p_user), '{}'::jsonb);
$$;
create or replace function public.rpg_arena_skins(p_match_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_m public.rpg_arena_matches%rowtype;
begin
  select * into v_m from public.rpg_arena_matches where id = p_match_id;
  if not found or v_uid is null or (v_m.host_id <> v_uid and v_m.guest_id is distinct from v_uid) then raise exception 'Diesen Kampf gibt es nicht.'; end if;
  return jsonb_build_object('host', public.rpg_skins_von(v_m.host_id), 'gast', case when v_m.guest_id is null then '{}'::jsonb else public.rpg_skins_von(v_m.guest_id) end);
end;
$$;

revoke all on function public.rpg_skins(), public.rpg_skin_buy(text), public.rpg_skin_equip(text, text), public.rpg_skins_von(uuid), public.rpg_arena_skins(uuid) from public, anon;
grant execute on function public.rpg_skins(), public.rpg_skin_buy(text), public.rpg_skin_equip(text, text), public.rpg_arena_skins(uuid) to authenticated;

commit;
