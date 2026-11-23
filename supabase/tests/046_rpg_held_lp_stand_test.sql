-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 046 (LP-Stand). Voraussetzung: 040–045 und ihre Tests sind gelaufen.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
set role authenticated;
select pg_temp.fehler('select public.rpg_held_lp_setzen(''00000000-0000-0000-0000-0000000040a1'', 5)', 'permission denied', 'Spieler setzen ihre LP nicht selbst');
reset role; set role service_role;
select pg_temp.ok(public.rpg_held_lp_setzen('00000000-0000-0000-0000-0000000040a1', 12), 'Der Server speichert 12 LP');
select pg_temp.fehler('select public.rpg_held_lp_setzen(''00000000-0000-0000-0000-0000000040a1'', -3)', 'Unzulässige', 'Negative LP abgelehnt');
select pg_temp.ok(not public.rpg_held_lp_setzen('00000000-0000-0000-0000-0000000040a9', 5), 'Ohne Helden: nichts gespeichert');
reset role;
select pg_temp.ok((select (lp_stand ->> 'lp')::int = 12 and (lp_stand ->> 'z')::bigint > 0 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a1'), 'Stand {lp: 12, z: Zeit} gespeichert');
set role service_role; select public.rpg_held_lp_setzen('00000000-0000-0000-0000-0000000040a1', null); reset role;
select pg_temp.ok((select lp_stand is null from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a1'), 'null = wieder voll');
select pg_temp.ok((select lp_stand is null from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a2'), 'Bens Stand bleibt unberührt');
\echo 046: alles in Ordnung
