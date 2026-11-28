-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 048 (Questabschluss v2). Voraussetzung: 040–047 sind eingespielt.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
-- Anna: Held mit Inventar (Handwerk 1200, Holzfällerei 50); Ben: Held ohne Inventar; Cora: Held, der Quest schon abgeschlossen hat
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000048a1', false), ('00000000-0000-0000-0000-0000000048b2', false), ('00000000-0000-0000-0000-0000000048c3', false) on conflict do nothing;
insert into public.rpg_held (user_id, geschlecht, frisur, haarfarbe, hautfarbe, waffe, inventar, quests) values
  ('00000000-0000-0000-0000-0000000048a1', 'frau', 'zopf', 'grau', 'hell', 'schwert', '{"angelegt": {"waffe": "ritterschwert"}, "rucksack": ["splitter"], "v": 2, "berufe": {"handwerk": 1200, "holzfaellerei": 50}}', '{"t": {"s": "auftrag_3"}}'),
  ('00000000-0000-0000-0000-0000000048b2', 'mann', 'scheitel', 'grau', 'hell', 'bogen', null, '{}'),
  ('00000000-0000-0000-0000-0000000048c3', 'mann', 'scheitel', 'grau', 'hell', 'stab', null, '{"t": {"s": "fertig"}}') on conflict do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000048a1', false);
select pg_temp.ok((public.rpg_held_lesen() ->> 'questpunkte')::int = 0, 'Bestehender Held: 0 Questpunkte');
select pg_temp.ok((public.rpg_held_lesen() -> 'inventar' -> 'berufe' ->> 'handwerk')::int = 1200 and public.rpg_held_lesen() -> 'quests' -> 't' ->> 's' = 'auftrag_3', 'Inventar, Berufe und Queststand bleiben erhalten');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000048a1'', ''t'', ''{}'', ''{}'', 1)', 'permission denied', 'Spieler schließen keinen Quest selbst ab');
reset role; set role service_role;
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000048a1'', ''t'', ''{"geschick": -5}'', ''{}'', 0)', 'Negative', 'Negative XP abgelehnt');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000048a1'', ''t'', ''{"zauberei": 5}'', ''{}'', 0)', 'Unbekannter Kampfskill', 'Unbekannter Kampfskill abgelehnt');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000048a1'', ''t'', ''{}'', ''{"X; drop": 5}'', 0)', 'Unbekannter Beruf', 'Unsinniger Beruf abgelehnt');
select pg_temp.fehler('select public.rpg_held_quest_abschluss_v2(''00000000-0000-0000-0000-0000000048a1'', ''t'', ''{}'', ''{}'', -1)', 'Negative Questpunkte', 'Negative Questpunkte abgelehnt');
reset role; create temp table vorher as select skill_geschick, skill_defense, inventar from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048a1'; grant select on vorher to service_role; set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000048a1', 't', '{"geschick": 150, "defense": 5000}', '{"schmieden": 40, "holzfaellerei": 30, "handwerk": 99999}', 25), 'Abschluss mit Kampf-XP, Berufe-XP und Questpunkten');
select pg_temp.ok(not public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000048a1', 't', '{"geschick": 150}', '{"schmieden": 40}', 3), 'Zweiter Abschluss: keine zweite Belohnung');
reset role;
select pg_temp.ok((select h.skill_geschick = v.skill_geschick + 150 and h.skill_defense = v.skill_defense + 1000 from public.rpg_held h, vorher v where h.user_id = '00000000-0000-0000-0000-0000000048a1'), 'Kampf-XP genau einmal, höchstens 1000 je Skill');
select pg_temp.ok((select inventar -> 'berufe' = '{"handwerk": 2200, "holzfaellerei": 80, "schmieden": 40}'::jsonb from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048a1'), 'Berufe-XP in inventar.berufe (neu, dazu, höchstens 1000)');
select pg_temp.ok((select inventar -> 'rucksack' = '["splitter"]'::jsonb and inventar -> 'angelegt' ->> 'waffe' = 'ritterschwert' from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048a1'), 'Rucksack und Ausrüstung unverändert');
select pg_temp.ok((select questpunkte = 10 and quests -> 't' ->> 's' = 'fertig' from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048a1'), 'Questpunkte höchstens 10 je Quest, Stand „fertig“');
set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000048b2', 't', '{"lp": 100}', '{"schmieden": 40}', 2), 'Held ohne Inventar: Abschluss geht');
select pg_temp.ok(not public.rpg_held_quest_abschluss_v2('00000000-0000-0000-0000-0000000048c3', 't', '{"lp": 100}', '{}', 2), 'Schon abgeschlossen (alter Abschluss): nichts');
reset role;
select pg_temp.ok((select inventar is null and questpunkte = 2 and skill_lp = 100 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048b2'), 'Ohne Inventar: kein halbes Inventar angelegt, Punkte und XP gebucht');
select pg_temp.ok((select questpunkte = 0 and skill_lp = 0 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048c3'), 'Coras Held bleibt unberührt');
select pg_temp.ok((select count(*) = 1 from pg_proc where proname = 'rpg_held_quest_abschluss'), 'Die alte Abschluss-Funktion (045) bleibt bestehen');
\echo 048: alles in Ordnung
