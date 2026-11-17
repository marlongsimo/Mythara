-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 031 (Fahrplan der Skin-Pakete).
\set ON_ERROR_STOP on
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000031a1', false);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000031a1', 'Fp_Anna');
insert into public.rpg_hero_collection (user_id, hero_id, quelle) values ('00000000-0000-0000-0000-0000000031a1', 'gelehrter', 'start'), ('00000000-0000-0000-0000-0000000031a1', 'berserker', 'start');
insert into public.rpg_wallet (user_id, betrag) values ('00000000-0000-0000-0000-0000000031a1', 5000) on conflict (user_id) do update set betrag = excluded.betrag;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
-- Uhr verstellen: alle Termine so verschieben, dass „jetzt“ p nach dem Start von „Unter dem Eis“ liegt
create function pg_temp.jetzt_ist(p interval) returns void language plpgsql security definer as $$
declare d interval := now() - ((select von from public.rpg_skin_bundles where id = 'unter_dem_eis') + p);
begin update public.rpg_skin_bundles set von = von + d, bis = bis + d where id <> 'schattenreich'; update public.rpg_skin_items set ab = ab + d where ab is not null; end $$;
create function pg_temp.plan() returns text language sql security definer as $$
  select string_agg(id || ' ' || to_char(von at time zone 'Europe/Berlin', 'DD.MM.YYYY HH24:MI') || '-' || to_char(bis at time zone 'Europe/Berlin', 'DD.MM.YYYY HH24:MI') || ' ' || preis, ' | ' order by von) from public.rpg_skin_bundles where id <> 'schattenreich'; $$;
create function pg_temp.mit_ab() returns integer language sql security definer as $$ select count(*)::int from public.rpg_skin_items where ab is not null; $$;
grant execute on all functions in schema pg_temp to authenticated;
select pg_temp.ok(pg_temp.plan() = 'unter_dem_eis 27.11.2026 20:00-04.12.2026 20:00 1365 | glut_und_asche 04.12.2026 20:00-11.12.2026 20:00 1365 | mondbaendiger 11.12.2026 20:00-18.12.2026 20:00 1365 | goldene_garde 18.12.2026 20:00-25.12.2026 20:00 1365 | sonnengott 25.12.2026 20:00-01.01.2027 20:00 1365' and pg_temp.mit_ab() = 15,
  'Fahrplan: fünf Pakete ab 27.11.2026, 20 Uhr deutscher Zeit, je sieben Tage, nahtlos; 15 Skins mit Starttermin');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000031a1', false);
set role authenticated;
select pg_temp.jetzt_ist(interval '-1 hour');
select pg_temp.ok(not exists (select 1 from jsonb_array_elements(public.rpg_skin_bundles_list()->'pakete') p where p->>'id' <> 'schattenreich') and not (public.rpg_skins()->'katalog' @> '[{"id":"gelehrter_s1"}]'::jsonb)
  and public.rpg_skins()->'katalog' @> '[{"id":"berserker_wolfsblut"}]'::jsonb, 'Eine Stunde vor dem Start: kein neues Paket, die Paket-Skins sind beim Händler nicht zu sehen, die übrigen schon');
select pg_temp.fehler('select public.rpg_skin_buy(''gelehrter_s1'')', 'führt der Händler nicht', 'Vor dem Start lässt sich der Skin auch nicht direkt kaufen');
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''unter_dem_eis'')', 'gibt es nicht mehr', '… und das Paket auch nicht');
select pg_temp.jetzt_ist(interval '1 minute');
select pg_temp.ok(public.rpg_skin_bundles_list()->'pakete' @> '[{"id":"unter_dem_eis","preis":1365,"einzeln":1950}]'::jsonb and not (public.rpg_skin_bundles_list()->'pakete' @> '[{"id":"glut_und_asche"}]'::jsonb)
  and public.rpg_skins()->'katalog' @> '[{"id":"gelehrter_s1","preis":650}]'::jsonb and not (public.rpg_skins()->'katalog' @> '[{"id":"berserker_s1"}]'::jsonb), 'Nach dem Start: „Unter dem Eis“ läuft, seine Skins sind da; das nächste Paket und dessen Skins noch nicht');
select pg_temp.ok((public.rpg_skin_buy('gelehrter_s1')->>'waehrung')::int = 4350, 'Der Skin lässt sich jetzt einzeln kaufen');
select pg_temp.jetzt_ist(interval '7 days 1 minute');
select pg_temp.ok(not (public.rpg_skin_bundles_list()->'pakete' @> '[{"id":"unter_dem_eis"}]'::jsonb) and public.rpg_skin_bundles_list()->'pakete' @> '[{"id":"glut_und_asche"}]'::jsonb
  and public.rpg_skins()->'katalog' @> '[{"id":"duellant_s3","preis":650}]'::jsonb and public.rpg_skins()->'katalog' @> '[{"id":"berserker_s1"}]'::jsonb, 'Sieben Tage später: nahtloser Wechsel zu „Glut und Asche“; die Eis-Skins bleiben einzeln für 650');
select pg_temp.jetzt_ist(interval '35 days 1 minute');
select pg_temp.ok(not exists (select 1 from jsonb_array_elements(public.rpg_skin_bundles_list()->'pakete') p where p->>'id' <> 'schattenreich') and public.rpg_skins()->'katalog' @> '[{"id":"tiergefaehrte_s3"}]'::jsonb, 'Nach fünf Wochen: kein Paket mehr, alle 15 Skins einzeln im Angebot');
reset role;
