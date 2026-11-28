-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 045 (Queststand). Voraussetzung: 040–044 und ihre Tests sind gelaufen.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok((public.rpg_held_lesen() -> 'quests') = '{}'::jsonb, 'Bestehender Held: noch kein Queststand');
select pg_temp.ok((public.rpg_held_lesen() -> 'inventar') is not null and (public.rpg_held_lesen() -> 'skills' ->> 'lp') is not null, 'Inventar und Skills bleiben erhalten');
select pg_temp.fehler('select public.rpg_held_quest_setzen(''00000000-0000-0000-0000-0000000040a1'', ''die_gesperrte_strasse'', ''wachen'')', 'permission denied', 'Spieler setzen ihren Queststand nicht selbst');
select pg_temp.fehler('select public.rpg_held_quest_abschluss(''00000000-0000-0000-0000-0000000040a1'', ''die_gesperrte_strasse'', 1, 1, 1, 1, 1, 1)', 'permission denied', 'und schließen keinen Quest selbst ab');
reset role; set role service_role;
select pg_temp.ok(public.rpg_held_quest_setzen('00000000-0000-0000-0000-0000000040a1', 'die_gesperrte_strasse', 'angenommen'), 'Der Server setzt einen Stand');
select pg_temp.fehler('select public.rpg_held_quest_setzen(''00000000-0000-0000-0000-0000000040a1'', ''die_gesperrte_strasse'', ''fertig'')', 'Abschluss nur', '„fertig“ nur über den Abschluss');
select pg_temp.fehler('select public.rpg_held_quest_setzen(''00000000-0000-0000-0000-0000000040a1'', ''X; drop'', ''a'')', 'Unbekannte', 'Unsinnige Quest-ID abgelehnt');
reset role; create temp table vorher as select skill_geschick, skill_lp, skill_defense from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a1'; grant select on vorher to service_role; set role service_role;
select pg_temp.ok(public.rpg_held_quest_abschluss('00000000-0000-0000-0000-0000000040a1', 'die_gesperrte_strasse', 150, 150, 150, 150, 100, 200), 'Abschluss mit Belohnung');
select pg_temp.ok(not public.rpg_held_quest_abschluss('00000000-0000-0000-0000-0000000040a1', 'die_gesperrte_strasse', 150, 150, 150, 150, 100, 200), 'Zweiter Abschluss: keine zweite Belohnung');
select pg_temp.ok(not public.rpg_held_quest_setzen('00000000-0000-0000-0000-0000000040a1', 'die_gesperrte_strasse', 'angenommen'), 'Ein abgeschlossener Quest bleibt abgeschlossen');
reset role;
select pg_temp.ok((select h.skill_geschick = v.skill_geschick + 150 and h.skill_lp = v.skill_lp + 100 and h.skill_defense = v.skill_defense + 200 from public.rpg_held h, vorher v where h.user_id = '00000000-0000-0000-0000-0000000040a1'), 'XP genau einmal gutgeschrieben (150 / LP 100 / Defense 200)');
select pg_temp.ok((select quests -> 'die_gesperrte_strasse' ->> 's' = 'fertig' from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a1'), 'Stand „fertig“ gespeichert');
select pg_temp.ok((select quests = '{}'::jsonb from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a2'), 'Bens Queststand bleibt unberührt');
\echo 045: alles in Ordnung
