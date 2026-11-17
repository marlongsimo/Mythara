-- =====================================================================
-- MYTHARA · RPG · Migration 030: Skin-Pakete (mehrere Skins zusammen günstiger, für begrenzte Zeit)
-- =====================================================================
-- Voraussetzung: Migration 029 (Helden-Skins) in der Fassung mit den Vorab-Plätzen (<held>_s1 bis _s3) ist eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) rpg_skin_bundles / rpg_skin_bundle_items: Pakete mit Preis, Laufzeit (von/bis) und den enthaltenen Skins.
--      Das erste Paket: „Aus dem Schattenreich“ (schattenreich) – drei Skins für Vex, Faye und Brogar,
--      1365 Seelensplitter statt 1950. Es läuft sieben Tage ab dem ERSTEN Einspielen dieser Migration;
--      erneutes Einspielen verlängert es nicht.
--   2) rpg_skin_bundle_owned: wer welches Paket gekauft hat.
--   3) rpg_skin_bundles_list(): die gerade laufenden Pakete mit Preis, Ende, Skins, „gekauft“ und den schon vorhandenen Skins.
--      rpg_skin_bundle_buy(Paket): kauft alle Skins des Pakets zum Paketpreis. Anders als beim Einzelkauf muss man die
--      Helden dafür nicht besitzen (die Skins warten dann, bis der Held da ist). Wer schon einzelne Skins daraus hat,
--      bekommt die übrigen; der Preis bleibt gleich. Wer alle hat, kann nicht kaufen.
-- Die Skins des Pakets bleiben auch einzeln beim Händler (je 650) und nach Ablauf des Pakets erhältlich.
--
-- NUR FÜR DAS RPG. Rückbau: 030_rpg_skin_pakete_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_skin_items') is null or to_regprocedure('public.rpg_skins()') is null then raise exception 'Migration 029 (Helden-Skins) fehlt.'; end if;
  if (select count(*) from public.rpg_skin_items where id in ('assassine_s1', 'tiergefaehrte_s2', 'wanderheiler_s2')) < 3 then
    raise exception 'Migration 029 ist noch in der alten Fassung (ohne Vorab-Plätze). Bitte erst die aktuelle 029 einspielen.';
  end if;
end $$;

create table if not exists public.rpg_skin_bundles (
  id     text         primary key check (id ~ '^[a-z][a-z0-9_]{1,40}$'),
  preis  integer      not null check (preis >= 0),
  von    timestamptz  not null default now(),
  bis    timestamptz  not null
);
create table if not exists public.rpg_skin_bundle_items (
  bundle_id  text  not null references public.rpg_skin_bundles(id) on delete cascade,
  skin_id    text  not null references public.rpg_skin_items(id),
  primary key (bundle_id, skin_id)
);
create table if not exists public.rpg_skin_bundle_owned (
  user_id     uuid         not null references auth.users(id) on delete cascade,
  bundle_id   text         not null references public.rpg_skin_bundles(id),
  preis       integer      not null,
  created_at  timestamptz  not null default now(),
  primary key (user_id, bundle_id)
);
alter table public.rpg_skin_bundles      enable row level security;
alter table public.rpg_skin_bundle_items enable row level security;
alter table public.rpg_skin_bundle_owned enable row level security;
revoke all on public.rpg_skin_bundles, public.rpg_skin_bundle_items, public.rpg_skin_bundle_owned from anon, authenticated;

insert into public.rpg_skin_bundles (id, preis, von, bis) values ('schattenreich', 1365, now(), now() + interval '7 days') on conflict (id) do nothing;
insert into public.rpg_skin_bundle_items (bundle_id, skin_id) values ('schattenreich', 'assassine_s1'), ('schattenreich', 'tiergefaehrte_s2'), ('schattenreich', 'wanderheiler_s2')
  on conflict do nothing;

create or replace function public.rpg_skin_bundles_list()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_sammlung_konto() then return jsonb_build_object('konto', false); end if;
  return jsonb_build_object('konto', true,
    'waehrung', coalesce((select betrag from public.rpg_wallet where user_id = v_uid), 0),
    'pakete', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'preis', b.preis, 'bis', b.bis,
        'einzeln', (select coalesce(sum(i.preis), 0) from public.rpg_skin_bundle_items bi join public.rpg_skin_items i on i.id = bi.skin_id where bi.bundle_id = b.id),
        'skins', (select coalesce(jsonb_agg(bi.skin_id order by bi.skin_id), '[]'::jsonb) from public.rpg_skin_bundle_items bi where bi.bundle_id = b.id),
        'hat', (select coalesce(jsonb_agg(bi.skin_id order by bi.skin_id), '[]'::jsonb) from public.rpg_skin_bundle_items bi join public.rpg_skin_owned o on o.skin_id = bi.skin_id and o.user_id = v_uid where bi.bundle_id = b.id),
        'gekauft', exists (select 1 from public.rpg_skin_bundle_owned bo where bo.user_id = v_uid and bo.bundle_id = b.id)
          or not exists (select 1 from public.rpg_skin_bundle_items bi where bi.bundle_id = b.id and not exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = bi.skin_id))) order by b.bis, b.id)
      from public.rpg_skin_bundles b where now() >= b.von and now() < b.bis), '[]'::jsonb));
end;
$$;

create or replace function public.rpg_skin_bundle_buy(p_id text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_b public.rpg_skin_bundles%rowtype; v_n integer;
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Der Händler handelt nur mit Spielerkonten.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_shop:' || v_uid::text));
  select * into v_b from public.rpg_skin_bundles where id = p_id and now() >= von and now() < bis;
  if not found then raise exception 'Dieses Angebot gibt es nicht mehr.'; end if;
  select count(*) into v_n from public.rpg_skin_bundle_items bi where bi.bundle_id = p_id
    and not exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = bi.skin_id);
  if v_n = 0 or exists (select 1 from public.rpg_skin_bundle_owned where user_id = v_uid and bundle_id = p_id) then raise exception 'Dieses Paket besitzt du schon.'; end if;
  if v_b.preis > 0 then
    update public.rpg_wallet set betrag = betrag - v_b.preis, updated_at = now() where user_id = v_uid and betrag >= v_b.preis;
    if not found then raise exception 'Dafür reichen deine Seelensplitter nicht.'; end if;
  end if;
  insert into public.rpg_skin_owned (user_id, skin_id, preis)
    select v_uid, bi.skin_id, v_b.preis / v_n from public.rpg_skin_bundle_items bi where bi.bundle_id = p_id on conflict (user_id, skin_id) do nothing;
  insert into public.rpg_skin_bundle_owned (user_id, bundle_id, preis) values (v_uid, p_id, v_b.preis);
  return public.rpg_skin_bundles_list();
end;
$$;

revoke all on function public.rpg_skin_bundles_list(), public.rpg_skin_bundle_buy(text) from public, anon;
grant execute on function public.rpg_skin_bundles_list(), public.rpg_skin_bundle_buy(text) to authenticated;

commit;
