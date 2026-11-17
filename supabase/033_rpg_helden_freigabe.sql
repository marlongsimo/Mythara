-- =====================================================================
-- MYTHARA · RPG · Migration 033: Neue Helden freigeben (zuerst: Thessa, die Runenklinge) und ihr Start-Angebot
-- =====================================================================
-- Voraussetzung: Migrationen 006 (Heldensammlung), 008 (Seelensplitter), 023 (Erfahrungspakete) und 029 (Skins) sind eingespielt.
--
-- Diese Migration gibt NOCH NICHTS frei. Sie legt nur bereit, was zur Freigabe gebraucht wird:
--   1) rpg_hero_geplant: geplante Helden mit Klasse, Skin, Inhalt und Preis des Start-Angebots und dessen Laufzeit.
--      Eingetragen ist Thessa (runenklinge, Zauberer): Skin runenklinge_s1, zwei große und ein mittleres Erfahrungspaket,
--      1698 Seelensplitter (40 % unter dem Einzelpreis von 2830), fünf Tage.
--   2) rpg_admin_hero_release(Held): NUR FÜR ADMINS – der Schalter. Trägt den Helden in den Heldenkatalog ein (ab dann ist er
--      wie jeder andere zu bekommen: Heldentoken, 830 Seelensplitter, Held der Woche, Heldenwahl), legt seine Skins an
--      (650) und startet das Start-Angebot für die geplante Laufzeit. Lässt sich je Held nur einmal ausführen.
--   3) rpg_admin_hero_plan(): Übersicht für den Admin-Bereich (geplant, freigegeben, Angebot läuft bis …).
--   4) rpg_hero_katalog(): die Kennungen aller freigegebenen Helden – daran erkennt das Spiel, dass ein neuer Held da ist.
--   5) rpg_launch_list() / rpg_launch_buy(Angebot): das Start-Angebot beim Händler. Der Kauf schaltet den Helden frei,
--      gibt den Skin und legt die Erfahrungspakete in den Vorrat. Jedes Konto kann es einmal kaufen – zum vollen
--      Angebotspreis auch dann, wenn es den Helden oder den Skin schon hat.
-- Bestehende Funktionen werden nicht geändert.
--
-- NUR FÜR DAS RPG. Rückbau: 033_rpg_helden_freigabe_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_hero_catalog') is null or to_regprocedure('public.rpg_ist_admin()') is null then raise exception 'Migration 006 (Heldensammlung) fehlt.'; end if;
  if to_regclass('public.rpg_wallet') is null then raise exception 'Migration 008 (Seelensplitter) fehlt.'; end if;
  if to_regclass('public.rpg_xp_inventory') is null or to_regclass('public.rpg_xp_packs') is null then raise exception 'Migration 023 (Erfahrungspakete) fehlt.'; end if;
  if to_regclass('public.rpg_skin_items') is null then raise exception 'Migration 029 (Helden-Skins) fehlt.'; end if;
end $$;

create table if not exists public.rpg_hero_geplant (
  hero_id       text         primary key check (hero_id ~ '^[a-z_]{2,30}$'),
  klasse        text         not null check (klasse in ('krieger', 'zauberer', 'schurke', 'kleriker', 'waldlaeufer')),
  skin_id       text         check (skin_id ~ '^[a-z][a-z0-9_]{1,40}$'),
  pakete        jsonb        not null default '{}'::jsonb,      -- Erfahrungspakete im Start-Angebot: { "gross": 2, "mittel": 1 }
  preis         integer      not null check (preis >= 0),      -- Preis des Start-Angebots
  tage          integer      not null default 5 check (tage between 1 and 60),
  freigegeben   timestamptz                                     -- gesetzt durch rpg_admin_hero_release
);
create table if not exists public.rpg_launch_offers (
  id        text         primary key,                           -- = hero_id
  hero_id   text         not null,
  skin_id   text,
  pakete    jsonb        not null default '{}'::jsonb,
  preis     integer      not null,
  von       timestamptz  not null default now(),
  bis       timestamptz  not null
);
create table if not exists public.rpg_launch_owned (
  user_id     uuid         not null references auth.users(id) on delete cascade,
  offer_id    text         not null references public.rpg_launch_offers(id),
  preis       integer      not null,
  created_at  timestamptz  not null default now(),
  primary key (user_id, offer_id)
);
alter table public.rpg_hero_geplant  enable row level security;
alter table public.rpg_launch_offers enable row level security;
alter table public.rpg_launch_owned  enable row level security;
revoke all on public.rpg_hero_geplant, public.rpg_launch_offers, public.rpg_launch_owned from anon, authenticated;

insert into public.rpg_hero_geplant (hero_id, klasse, skin_id, pakete, preis, tage)
  values ('runenklinge', 'zauberer', 'runenklinge_s1', '{"gross": 2, "mittel": 1}'::jsonb, 1698, 5) on conflict (hero_id) do nothing;

-- Kennungen aller freigegebenen Helden
create or replace function public.rpg_hero_katalog()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(hero_id order by hero_id), '[]'::jsonb) from public.rpg_hero_catalog;
$$;

-- Der Schalter (nur Admins)
create or replace function public.rpg_admin_hero_release(p_held text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_g public.rpg_hero_geplant%rowtype;
begin
  if not public.rpg_ist_admin() then raise exception 'Nur Admins geben Helden frei.'; end if;
  select * into v_g from public.rpg_hero_geplant where hero_id = p_held for update;
  if not found then raise exception 'Für diesen Helden ist keine Freigabe vorbereitet.'; end if;
  if v_g.freigegeben is not null then raise exception 'Dieser Held ist schon freigegeben.'; end if;
  insert into public.rpg_hero_catalog (hero_id, klasse) values (v_g.hero_id, v_g.klasse) on conflict (hero_id) do nothing;
  insert into public.rpg_skin_items (id, hero_id, preis, reihe) select v_g.hero_id || '_s' || n, v_g.hero_id, 650, 100 + n from generate_series(1, 3) n on conflict (id) do nothing;
  if v_g.skin_id is not null then insert into public.rpg_skin_items (id, hero_id, preis, reihe) values (v_g.skin_id, v_g.hero_id, 650, 101) on conflict (id) do nothing; end if;
  insert into public.rpg_launch_offers (id, hero_id, skin_id, pakete, preis, von, bis)
    values (v_g.hero_id, v_g.hero_id, v_g.skin_id, v_g.pakete, v_g.preis, now(), now() + make_interval(days => v_g.tage)) on conflict (id) do nothing;
  update public.rpg_hero_geplant set freigegeben = now() where hero_id = p_held;
  return public.rpg_admin_hero_plan();
end;
$$;

create or replace function public.rpg_admin_hero_plan()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.rpg_ist_admin() then raise exception 'Nur Admins sehen die geplanten Helden.'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('held', g.hero_id, 'klasse', g.klasse, 'skin', g.skin_id, 'pakete', g.pakete, 'preis', g.preis, 'tage', g.tage,
      'freigegeben', g.freigegeben, 'angebot_bis', (select o.bis from public.rpg_launch_offers o where o.id = g.hero_id),
      'gekauft', (select count(*) from public.rpg_launch_owned w where w.offer_id = g.hero_id)) order by g.hero_id) from public.rpg_hero_geplant g), '[]'::jsonb);
end;
$$;

-- Einzelpreis eines Angebots: Held + Skin + Pakete
create or replace function public.rpg_launch_einzeln(p_o public.rpg_launch_offers)
returns integer language sql stable security definer set search_path = public as $$
  select public.rpg_hero_preis() + coalesce((select preis from public.rpg_skin_items where id = p_o.skin_id), 0)
    + coalesce((select sum(p.preis * (e.value)::int) from jsonb_each_text(p_o.pakete) e join public.rpg_xp_packs p on p.id = e.key), 0)::int;
$$;

create or replace function public.rpg_launch_list()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_sammlung_konto() then return jsonb_build_object('konto', false); end if;
  return jsonb_build_object('konto', true,
    'waehrung', coalesce((select betrag from public.rpg_wallet where user_id = v_uid), 0),
    'angebote', coalesce((select jsonb_agg(jsonb_build_object('id', o.id, 'held', o.hero_id, 'skin', o.skin_id, 'pakete', o.pakete, 'preis', o.preis, 'bis', o.bis,
        'einzeln', public.rpg_launch_einzeln(o),
        'ep', coalesce((select sum(p.xp * (e.value)::int) from jsonb_each_text(o.pakete) e join public.rpg_xp_packs p on p.id = e.key), 0),
        'hat_held', exists (select 1 from public.rpg_hero_collection c where c.user_id = v_uid and c.hero_id = o.hero_id),
        'hat_skin', exists (select 1 from public.rpg_skin_owned s where s.user_id = v_uid and s.skin_id = o.skin_id),
        'gekauft', exists (select 1 from public.rpg_launch_owned w where w.user_id = v_uid and w.offer_id = o.id)) order by o.bis, o.id)
      from public.rpg_launch_offers o where now() >= o.von and now() < o.bis), '[]'::jsonb));
end;
$$;

create or replace function public.rpg_launch_buy(p_id text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_o public.rpg_launch_offers%rowtype; v_e record;
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Der Händler handelt nur mit Spielerkonten.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_shop:' || v_uid::text));
  select * into v_o from public.rpg_launch_offers where id = p_id and now() >= von and now() < bis;
  if not found then raise exception 'Dieses Angebot gibt es nicht mehr.'; end if;
  if exists (select 1 from public.rpg_launch_owned where user_id = v_uid and offer_id = p_id) then raise exception 'Dieses Angebot hast du schon gekauft.'; end if;
  if v_o.preis > 0 then
    update public.rpg_wallet set betrag = betrag - v_o.preis, updated_at = now() where user_id = v_uid and betrag >= v_o.preis;
    if not found then raise exception 'Dafür reichen deine Seelensplitter nicht.'; end if;
  end if;
  insert into public.rpg_hero_collection (user_id, hero_id, quelle) values (v_uid, v_o.hero_id, 'code') on conflict (user_id, hero_id) do nothing;
  if v_o.skin_id is not null then insert into public.rpg_skin_owned (user_id, skin_id, preis) values (v_uid, v_o.skin_id, 0) on conflict (user_id, skin_id) do nothing; end if;
  for v_e in select e.key as pack, (e.value)::int as n from jsonb_each_text(v_o.pakete) e join public.rpg_xp_packs p on p.id = e.key loop
    insert into public.rpg_xp_inventory (user_id, pack_id, anzahl) values (v_uid, v_e.pack, v_e.n)
      on conflict (user_id, pack_id) do update set anzahl = public.rpg_xp_inventory.anzahl + excluded.anzahl, updated_at = now();
  end loop;
  insert into public.rpg_launch_owned (user_id, offer_id, preis) values (v_uid, p_id, v_o.preis);
  return public.rpg_launch_list();
end;
$$;

revoke all on function public.rpg_hero_katalog(), public.rpg_admin_hero_release(text), public.rpg_admin_hero_plan(), public.rpg_launch_einzeln(public.rpg_launch_offers), public.rpg_launch_list(), public.rpg_launch_buy(text) from public, anon;
grant execute on function public.rpg_hero_katalog(), public.rpg_admin_hero_release(text), public.rpg_admin_hero_plan(), public.rpg_launch_list(), public.rpg_launch_buy(text) to authenticated;

commit;
