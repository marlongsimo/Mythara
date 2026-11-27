-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 051 (Quest-Lohn bis 50.000 je Skill und Beruf). Voraussetzung: 040–048 sind eingespielt.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000051a1', false), ('00000000-0000-0000-0000-0000000051b2', false), ('00000000-0000-0000-0000-0000000051c3', false) on conflict do nothing;
insert into public.rpg_held (user_id, geschlecht, frisur, haarfarbe, hautfarbe, waffe, inventar, quests) values
  ('00000000-0000-0000-0000-0000000051a1', 'frau', 'zopf', 'grau', 'hell', 'schwert', '{"rucksack": [], "v": 2, "berufe": {"fischen": 10}}', '{}'),
  ('00000000-0000-0000-0000-0000000051b2', 'mann', 'scheitel', 'grau', 'hell', 'bogen', '{"rucksack": [], "v": 2, "berufe": {}}', '{}'),
  ('00000000-0000-0000-0000-0000000051c3', 'mann', 'scheitel', 'grau', 'hell', 'stab', '{"rucksack": [], "v": 2, "berufe": {}}', '{}') on conflict do nothing;
-- vorher (048): höchstens 1000
set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000051c3', 'q', '{"staerke": 5000}', '{"kochen": 5000}', 1), 'Vor 051: Abschluss');
reset role;
select pg_temp.ok((select skill_staerke = 1000 and (inventar -> 'berufe' ->> 'kochen')::int = 1000 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000051c3'), 'Vor 051: 5.000 werden auf 1.000 gekappt (wie in 048)');
\ir ../051_rpg_held_quest_lohn.sql
\ir ../051_rpg_held_quest_lohn.sql
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000051a1', false);
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000051a1'', ''q'', ''{}'', ''{}'', 1)', 'permission denied', 'Spieler schließen keinen Quest selbst ab (auch nach 051)');
reset role; set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000051a1', 'q', '{"staerke": 5000, "lp": 2500, "defense": 50000}', '{"fischen": 12000}', 2), 'Abschluss mit hohem Lohn');
select pg_temp.ok(not public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000051a1', 'q', '{"staerke": 5000}', '{}', 2), 'Zweiter Abschluss: keine zweite Belohnung');
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000051b2', 'q', '{"magie": 80000}', '{"kochen": 70000}', 99), 'Über der Grenze: Abschluss geht');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000051a1'', ''r'', ''{"geschick": -5}'', ''{}'', 0)', 'Negative', 'Negative XP weiter abgelehnt');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000051a1'', ''r'', ''{"zauberei": 5}'', ''{}'', 0)', 'Unbekannter Kampfskill', 'Unbekannter Kampfskill weiter abgelehnt');
reset role;
select pg_temp.ok((select skill_staerke = 5000 and skill_lp = 2500 and skill_defense = 50000 and (inventar -> 'berufe' ->> 'fischen')::int = 12010 and questpunkte = 2 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000051a1'), 'Lohn bis 50.000 je Skill und Beruf ungekappt gebucht');
select pg_temp.ok((select skill_magie = 50000 and (inventar -> 'berufe' ->> 'kochen')::int = 50000 and questpunkte = 10 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000051b2'), 'Darüber: auf 50.000 gekappt, Questpunkte weiter höchstens 10');
\ir ../051_rpg_held_quest_lohn_rueckbau.sql
set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000051b2', 's', '{"geschick": 5000}', '{}', 1), 'Nach dem Rückbau: Abschluss geht');
reset role;
select pg_temp.ok((select skill_geschick = 1000 and skill_magie = 50000 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000051b2'), 'Rückbau: wieder höchstens 1.000, Gebuchtes bleibt');
\echo 051: alles in Ordnung
