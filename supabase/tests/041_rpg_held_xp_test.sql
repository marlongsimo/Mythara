-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 041 (Skill-XP des eigenen Helden). Voraussetzung: 040 und sein Test sind gelaufen.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok((public.rpg_held_lesen() -> 'xp') = '{"staerke":0,"geschick":0,"magie":0}'::jsonb, 'Bestehender Held: alle Skill-XP 0 (Level 1)');
select pg_temp.ok((public.rpg_held_lesen() ->> 'waffe') = 'stab', 'Aussehen und Waffe bleiben erhalten');
select pg_temp.fehler('select public.rpg_held_xp_gutschrift(''00000000-0000-0000-0000-0000000040a1'', 100, 0, 0)', 'permission denied', 'Spieler schreiben sich keine XP gut');
select pg_temp.fehler('update public.rpg_held set xp_staerke = 99999', 'permission denied', 'und ändern die Tabelle nicht direkt');
reset role; set role service_role;
select pg_temp.ok((public.rpg_held_xp_gutschrift('00000000-0000-0000-0000-0000000040a1', 30, 4, 0) ->> 'staerke') = '30', 'Der Server schreibt XP gut');
select pg_temp.ok((public.rpg_held_xp_gutschrift('00000000-0000-0000-0000-0000000040a1', 99999, 0, 0) ->> 'staerke') = '5030', 'je Aufruf höchstens 5000');
select pg_temp.fehler('select public.rpg_held_xp_gutschrift(''00000000-0000-0000-0000-0000000040a1'', -5, 0, 0)', 'Negative', 'Negative XP: abgelehnt');
select pg_temp.ok(public.rpg_held_xp_gutschrift('00000000-0000-0000-0000-0000000040a9', 10, 0, 0) is null, 'Ohne Helden: nichts gebucht');
select pg_temp.ok((select xp_staerke from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a2') = 0, 'Bens XP bleiben unberührt');
reset role; update public.rpg_held set xp_magie = 2511000 where user_id = '00000000-0000-0000-0000-0000000040a1'; set role service_role;
select pg_temp.ok((public.rpg_held_xp_gutschrift('00000000-0000-0000-0000-0000000040a1', 0, 0, 5000) ->> 'magie')::bigint = floor(100 * (power(100::numeric, 2.2) - 1)), 'Höchstens bis Level 100');
reset role; set role authenticated;
select pg_temp.ok((public.rpg_held_lesen() -> 'xp' ->> 'geschick') = '4', 'Anna liest ihre XP');
reset role;
\echo 041: alles in Ordnung
