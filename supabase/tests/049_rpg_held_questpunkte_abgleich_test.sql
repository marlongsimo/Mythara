-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 049. Voraussetzung: 040–048 und der Test 048 sind gelaufen
-- (Held 48a1 mit einem Abschluss); hier kommt ein Altspieler dazu.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000049d4', false) on conflict do nothing;
insert into public.rpg_held (user_id, geschlecht, frisur, haarfarbe, hautfarbe, waffe, quests) values
  ('00000000-0000-0000-0000-0000000049d4', 'frau', 'zopf', 'grau', 'hell', 'bogen', '{"die_gesperrte_strasse": {"s": "fertig"}, "osthof_der_stille_rain": {"s": "fertig"}, "nordwald_waldsaebel": {"s": "auftrag_3"}}') on conflict do nothing;
update public.rpg_held set questpunkte = 10 where user_id = '00000000-0000-0000-0000-0000000048a1';  -- mehr Punkte als Abschlüsse (Quest mit 10 Punkten)
\ir ../049_rpg_held_questpunkte_abgleich.sql
select pg_temp.ok((select questpunkte = 2 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000049d4'), 'Altspielerin: zwei alte Abschlüsse → 2 Questpunkte nachgetragen');
select pg_temp.ok((select questpunkte = 10 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000048a1'), 'Höhere bestehende Werte werden nicht verringert');
set role authenticated;
select pg_temp.fehler('select public.rpg_held_questpunkte_setzen(''00000000-0000-0000-0000-0000000049d4'', 2)', 'permission denied', 'Spieler setzen ihre Questpunkte nicht selbst');
reset role; set role service_role;
select pg_temp.fehler('select public.rpg_held_questpunkte_setzen(''00000000-0000-0000-0000-0000000049d4'', 21)', 'Mehr Questpunkte', 'Mehr als 10 je abgeschlossener Quest abgelehnt');
select pg_temp.fehler('select public.rpg_held_questpunkte_setzen(''00000000-0000-0000-0000-0000000049d4'', -1)', 'Unzulässige', 'Negative Punkte abgelehnt');
select pg_temp.ok(public.rpg_held_questpunkte_setzen('00000000-0000-0000-0000-0000000049d4', 3), 'Der Server führt die Kopie nach (3)');
select pg_temp.ok(not public.rpg_held_questpunkte_setzen('00000000-0000-0000-0000-0000000049d4', 3), 'Gleicher Wert: nichts zu tun');
reset role;
select pg_temp.ok((select questpunkte = 3 and quests -> 'nordwald_waldsaebel' ->> 's' = 'auftrag_3' from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000049d4'), 'Gespeichert, Queststand unverändert');
\echo 049: alles in Ordnung
