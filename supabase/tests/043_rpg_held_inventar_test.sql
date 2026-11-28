-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 043 (Inventar auf dem Server). Voraussetzung: 040–042 und ihre Tests sind gelaufen.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok((public.rpg_held_lesen() -> 'inventar') = 'null'::jsonb, 'Bestehender Held: noch kein Inventar gespeichert');
select pg_temp.ok((public.rpg_held_lesen() -> 'skills' ->> 'staerke') is not null, 'Skills bleiben erhalten');
select pg_temp.fehler('select public.rpg_held_inventar_setzen(''00000000-0000-0000-0000-0000000040a1'', ''{"angelegt":{},"rucksack":[]}'')', 'permission denied', 'Spieler setzen ihr Inventar nicht selbst');
select pg_temp.fehler('update public.rpg_held set inventar = ''{}''', 'permission denied', 'und ändern die Tabelle nicht direkt');
reset role; set role service_role;
select pg_temp.ok(public.rpg_held_inventar_setzen('00000000-0000-0000-0000-0000000040a1', '{"angelegt":{"waffe":"hirtenstab"},"rucksack":["ritterschwert"]}'), 'Der Server speichert das Inventar');
select pg_temp.fehler('select public.rpg_held_inventar_setzen(''00000000-0000-0000-0000-0000000040a1'', ''[1,2]'')', 'erwartete Form', 'Falsche Form: abgelehnt');
select pg_temp.fehler('select public.rpg_held_inventar_setzen(''00000000-0000-0000-0000-0000000040a1'', jsonb_build_object(''angelegt'', ''{}''::jsonb, ''rucksack'', (select jsonb_agg(i) from generate_series(1, 40) i)))', 'Zu viele', 'Mehr als 32 Rucksackplätze: abgelehnt');
select pg_temp.ok(not public.rpg_held_inventar_setzen('00000000-0000-0000-0000-0000000040a9', '{"angelegt":{},"rucksack":[]}'), 'Ohne Helden: nichts gespeichert');
select pg_temp.ok((select inventar from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a2') is null, 'Bens Inventar bleibt unberührt');
reset role; set role authenticated;
select pg_temp.ok((public.rpg_held_lesen() -> 'inventar' -> 'rucksack' ->> 0) = 'ritterschwert', 'Anna liest ihr Inventar');
reset role;
\echo 043: alles in Ordnung
