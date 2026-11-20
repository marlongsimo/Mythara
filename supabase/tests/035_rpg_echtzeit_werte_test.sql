-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 035 (EP und Seelensplitter vom Spielserver).
\set ON_ERROR_STOP on
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000035a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
select pg_temp.ok((select ep from public.rpg_echtzeit_werte where user_id = '00000000-0000-0000-0000-0000000035a1') = '{"schildwaechter": 90}'::jsonb and (select seelen from public.rpg_echtzeit_werte where user_id = '00000000-0000-0000-0000-0000000035a1') = 7, 'Übernahme: EP und Splitter aus dem bisherigen Spielstand');
select pg_temp.ok(not exists (select 1 from public.rpg_echtzeit_werte where user_id = '00000000-0000-0000-0000-0000000035a3'), 'Übernahme: Gäste bekommen nichts (kein Stand)');
set role authenticated;
select pg_temp.als(1);
select pg_temp.fehler('select * from public.rpg_echtzeit_werte', 'permission denied', 'Spieler können die Tabelle nicht direkt lesen');
select pg_temp.fehler('update public.rpg_echtzeit_werte set seelen = 99999', 'permission denied', '… und nicht ändern');
select pg_temp.fehler('select public.rpg_echtzeit_gutschrift(''00000000-0000-0000-0000-0000000035a1'', ''{"schildwaechter": 5000}''::jsonb, 5000, ''x'')', 'permission denied', 'Spieler können sich nichts gutschreiben');
select pg_temp.ok(public.rpg_echtzeit_werte() = '{"ep": {"schildwaechter": 90}, "seelen": 7}'::jsonb, 'Eigene Werte lesbar');
select pg_temp.als(2);
select pg_temp.ok(public.rpg_echtzeit_werte() = '{"ep": {}, "seelen": 0}'::jsonb, 'Anderes Konto sieht nur seine eigenen (leeren) Werte');
select pg_temp.als(3);
select pg_temp.fehler('select public.rpg_echtzeit_werte()', 'Spielerkonto', 'Gäste haben keine Werte');
reset role; set role service_role;
select pg_temp.ok(public.rpg_echtzeit_gutschrift('00000000-0000-0000-0000-0000000035a1', '{"schildwaechter": 52, "lichtbringer": 52}'::jsonb, 9, 'weidenhain/speicher') = '{"ep": {"lichtbringer": 52, "schildwaechter": 142}, "seelen": 16}'::jsonb, 'Server schreibt gut und bekommt die neuen Werte zurück');
select pg_temp.ok(public.rpg_echtzeit_gutschrift('00000000-0000-0000-0000-0000000035a2', '{"assassine": 13}'::jsonb, 3, 'weidenhain/muehle') = '{"ep": {"assassine": 13}, "seelen": 3}'::jsonb, 'Erste Gutschrift für ein Konto ohne Werte');
select pg_temp.fehler('select public.rpg_echtzeit_gutschrift(''00000000-0000-0000-0000-0000000035a1'', ''{"a1": 1, "b": 1, "c": 1, "d": 1}''::jsonb, 0, ''x'')', 'drei Helden', 'Mehr als drei Helden: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_gutschrift(''00000000-0000-0000-0000-0000000035a1'', ''{"vex": 99999}''::jsonb, 0, ''x'')', 'Grenzen', 'Zu viele EP: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_gutschrift(''00000000-0000-0000-0000-0000000035a1'', ''{}''::jsonb, -5, ''x'')', 'Grenzen', 'Negative Splitter: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_gutschrift(''00000000-0000-0000-0000-0000000035a3'', ''{}''::jsonb, 5, ''x'')', 'Kein Spielerkonto', 'Gast-Konto: abgelehnt');
select pg_temp.ok((select count(*) from public.rpg_echtzeit_kaempfe) = 2, 'Jede Gutschrift steht im Protokoll');
reset role;
\echo 035: alles in Ordnung
