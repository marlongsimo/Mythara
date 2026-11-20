-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 036 (gewonnene Kämpfe vom Spielserver).
\set ON_ERROR_STOP on
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000036a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
select pg_temp.ok((select count(*) from public.rpg_echtzeit_siege where user_id = '00000000-0000-0000-0000-0000000036a1') = 3, 'Übernahme: Weidenhain geschafft → drei Siege');
select pg_temp.ok((select array_agg(kampf order by kampf) from public.rpg_echtzeit_siege where user_id = '00000000-0000-0000-0000-0000000036a2') = array['speicher'], 'Übernahme: angefangene Runde → nur der schon gewonnene Kampf');
delete from public.rpg_echtzeit_siege where user_id = '00000000-0000-0000-0000-0000000036a2';
set role authenticated; select pg_temp.als(2);
select pg_temp.fehler('select * from public.rpg_echtzeit_siege', 'permission denied', 'Spieler können die Tabelle nicht direkt lesen');
select pg_temp.fehler('insert into public.rpg_echtzeit_siege (user_id, ort, kampf) values (''00000000-0000-0000-0000-0000000036a2'', ''weidenhain'', ''wehr'')', 'permission denied', '… und sich keine Siege eintragen');
select pg_temp.fehler('select public.rpg_echtzeit_sieg(''00000000-0000-0000-0000-0000000036a2'', ''weidenhain'', ''wehr'')', 'permission denied', '… auch nicht über die Server-Funktion');
select pg_temp.ok(public.rpg_echtzeit_siege() = '[]'::jsonb, 'Eigene Siege lesbar (noch keine)');
select pg_temp.als(3); select pg_temp.fehler('select public.rpg_echtzeit_siege()', 'Spielerkonto', 'Gäste haben keinen Fortschritt');
reset role; set role service_role;
select public.rpg_echtzeit_sieg('00000000-0000-0000-0000-0000000036a2', 'weidenhain', 'speicher'); select public.rpg_echtzeit_sieg('00000000-0000-0000-0000-0000000036a2', 'weidenhain', 'speicher');
select pg_temp.fehler('select public.rpg_echtzeit_sieg(''00000000-0000-0000-0000-0000000036a2'', ''Weiden Hain'', ''x'')', 'ungültig', 'Ungültiger Ort: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_sieg(''00000000-0000-0000-0000-0000000036a3'', ''weidenhain'', ''speicher'')', 'Kein Spielerkonto', 'Gast: abgelehnt');
reset role; set role authenticated; select pg_temp.als(2);
select pg_temp.ok(public.rpg_echtzeit_siege() = '[{"ort": "weidenhain", "kampf": "speicher"}]'::jsonb, 'Server trägt ein, doppelter Sieg zählt einmal');
select pg_temp.als(1); select pg_temp.ok(jsonb_array_length(public.rpg_echtzeit_siege()) = 3, 'Anderes Konto sieht nur seine eigenen Siege');
reset role;
\echo 036: alles in Ordnung
