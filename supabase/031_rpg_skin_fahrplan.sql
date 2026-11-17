-- =====================================================================
-- MYTHARA · RPG · Migration 031: Fahrplan der Skin-Pakete (fünf Pakete, je sieben Tage, nahtlos hintereinander)
-- =====================================================================
-- Voraussetzung: Migrationen 029 (Skins, Fassung mit Vorab-Plätzen) und 030 (Skin-Pakete) sind eingespielt.
--
-- Was diese Migration tut:
--   1) Fünf Pakete mit festem Start (jeweils 20:00 Uhr deutscher Zeit) und sieben Tagen Laufzeit, je 1365 Seelensplitter:
--        27.11.2026  Unter dem Eis       (Isolde, Lyra, Kael)
--        04.12.2026  Glut und Asche      (Ragnar, Morwen, Seran)
--        11.12.2026  Mondbändiger        (Torvald, Elara, Silra)
--        18.12.2026  Die Goldene Garde   (Isolde, Orin, Vaelin)
--        25.12.2026  Sonnengott          (Darian, Seran, Faye)      – endet am 01.01.2027, 20:00 Uhr
--      Jedes Paket erscheint und verschwindet von selbst.
--   2) rpg_skin_items bekommt die Spalte „ab“: Ein Skin ist erst ab diesem Zeitpunkt beim Händler zu sehen und zu kaufen.
--      Die 15 Skins der fünf Pakete bekommen den Start ihres Pakets. Danach bleiben sie einzeln (650) erhältlich.
--   3) rpg_skins() und rpg_skin_buy() (beide aus Migration 029) beachten „ab“. Sonst bleiben sie unverändert.
-- Erneutes Einspielen ändert Termine und Preise NICHT (wer sie später im Table Editor anpasst, behält seine Werte).
--
-- NUR FÜR DAS RPG. Rückbau: 031_rpg_skin_fahrplan_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_skin_bundles') is null or to_regprocedure('public.rpg_skin_bundle_buy(text)') is null then raise exception 'Migration 030 (Skin-Pakete) fehlt.'; end if;
  if (select count(*) from public.rpg_skin_items where id in ('duellant_s3', 'gelehrter_s1', 'wildnislaeufer_s2', 'berserker_s1', 'schattenmagier_s2', 'inquisitor_s2', 'schildwaechter_s2', 'lichtbringer_s2', 'trickser_s2', 'duellant_s2', 'kopfgeldjaeger_s2', 'elementarist_s2', 'inquisitor_s3', 'schattenlaeufer_s2', 'tiergefaehrte_s3')) < 15 then
    raise exception 'Migration 029 ist noch in der alten Fassung (ohne Vorab-Plätze). Bitte erst die aktuelle 029 einspielen.';
  end if;
end $$;

alter table public.rpg_skin_items add column if not exists ab timestamptz;   -- null = sofort

insert into public.rpg_skin_bundles (id, preis, von, bis) values
  ('unter_dem_eis', 1365, (timestamp '2026-11-27 20:00' at time zone 'Europe/Berlin'), (timestamp '2026-11-27 20:00' at time zone 'Europe/Berlin') + interval '7 days'),
  ('glut_und_asche', 1365, (timestamp '2026-12-04 20:00' at time zone 'Europe/Berlin'), (timestamp '2026-12-04 20:00' at time zone 'Europe/Berlin') + interval '7 days'),
  ('mondbaendiger', 1365, (timestamp '2026-12-11 20:00' at time zone 'Europe/Berlin'), (timestamp '2026-12-11 20:00' at time zone 'Europe/Berlin') + interval '7 days'),
  ('goldene_garde', 1365, (timestamp '2026-12-18 20:00' at time zone 'Europe/Berlin'), (timestamp '2026-12-18 20:00' at time zone 'Europe/Berlin') + interval '7 days'),
  ('sonnengott', 1365, (timestamp '2026-12-25 20:00' at time zone 'Europe/Berlin'), (timestamp '2026-12-25 20:00' at time zone 'Europe/Berlin') + interval '7 days')
  on conflict (id) do nothing;
insert into public.rpg_skin_bundle_items (bundle_id, skin_id) values
  ('unter_dem_eis', 'duellant_s3'), ('unter_dem_eis', 'gelehrter_s1'), ('unter_dem_eis', 'wildnislaeufer_s2'),
  ('glut_und_asche', 'berserker_s1'), ('glut_und_asche', 'schattenmagier_s2'), ('glut_und_asche', 'inquisitor_s2'),
  ('mondbaendiger', 'schildwaechter_s2'), ('mondbaendiger', 'lichtbringer_s2'), ('mondbaendiger', 'trickser_s2'),
  ('goldene_garde', 'duellant_s2'), ('goldene_garde', 'kopfgeldjaeger_s2'), ('goldene_garde', 'elementarist_s2'),
  ('sonnengott', 'inquisitor_s3'), ('sonnengott', 'schattenlaeufer_s2'), ('sonnengott', 'tiergefaehrte_s3')
  on conflict do nothing;
-- Die Skins erscheinen mit ihrem Paket (nur setzen, solange noch nichts eingetragen ist)
update public.rpg_skin_items i set ab = b.von from public.rpg_skin_bundle_items bi join public.rpg_skin_bundles b on b.id = bi.bundle_id
  where bi.skin_id = i.id and i.ab is null and b.id in ('unter_dem_eis', 'glut_und_asche', 'mondbaendiger', 'goldene_garde', 'sonnengott');

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
      from public.rpg_skin_items i where (i.aktiv and (i.ab is null or i.ab <= now())) or exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = i.id)), '[]'::jsonb),
    'aktiv', coalesce((select jsonb_object_agg(e.hero_id, e.skin_id) from public.rpg_skin_equipped e where e.user_id = v_uid), '{}'::jsonb));
end;
$$;

create or replace function public.rpg_skin_buy(p_id text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_i public.rpg_skin_items%rowtype;
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Der Händler handelt nur mit Spielerkonten.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_shop:' || v_uid::text));
  select * into v_i from public.rpg_skin_items where id = p_id and aktiv and (ab is null or ab <= now());
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

commit;
