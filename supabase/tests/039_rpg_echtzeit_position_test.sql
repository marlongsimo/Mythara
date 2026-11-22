-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 039 (gemerkte Stelle der Splitterlande).
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000039a1', false), ('00000000-0000-0000-0000-0000000039a3', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000039a1', 'Anna39');
set role authenticated;
select pg_temp.fehler('select * from public.rpg_echtzeit_position', 'permission denied', 'Spieler lesen die Tabelle nicht direkt');
select pg_temp.fehler('select public.rpg_echtzeit_position_setzen(''00000000-0000-0000-0000-0000000039a1'', ''waldweg'', 1, 2)', 'permission denied', 'Spieler setzen ihre Stelle nicht selbst (nur der Server)');
reset role; set role service_role;
select pg_temp.ok((public.rpg_echtzeit_position_setzen('00000000-0000-0000-0000-0000000039a1', 'waldweg', 6528.5, 6587.25) ->> 'ok')::boolean, 'Server merkt Annas Stelle');
select pg_temp.ok((select region = 'waldweg' and x = 6528.5 and y = 6587.25 from public.rpg_echtzeit_position where user_id = '00000000-0000-0000-0000-0000000039a1'), 'Der Server liest sie wieder');
select public.rpg_echtzeit_position_setzen('00000000-0000-0000-0000-0000000039a1', 'waldmark', null, null);
select pg_temp.ok((select region = 'waldmark' and x is null and y is null from public.rpg_echtzeit_position where user_id = '00000000-0000-0000-0000-0000000039a1'), 'Nach Tod oder Teleport: Start der Waldmark (x/y leer), ein Eintrag je Spieler');
select pg_temp.fehler('select public.rpg_echtzeit_position_setzen(''00000000-0000-0000-0000-0000000039a1'', ''Böse Region'', 1, 2)', 'Region', 'Ungültige Region: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_position_setzen(''00000000-0000-0000-0000-0000000039a1'', ''waldweg'', 1, null)', 'Stelle', 'Halbe Stelle: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_position_setzen(''00000000-0000-0000-0000-0000000039a1'', ''waldweg'', -5, 2)', 'Stelle', 'Stelle außerhalb: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_position_setzen(''00000000-0000-0000-0000-0000000039a3'', ''waldweg'', 1, 2)', 'Spielerkonto', 'Gäste haben keine gemerkte Stelle');
reset role;
\echo 039: alles in Ordnung
