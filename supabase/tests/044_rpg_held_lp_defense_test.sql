-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 044 (Skills LP und Defense). Voraussetzung: 040–043 und ihre Tests sind gelaufen.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok((public.rpg_held_lesen() -> 'skills' ->> 'lp') = '0' and (public.rpg_held_lesen() -> 'skills' ->> 'defense') = '0', 'Bestehender Held: LP und Defense beginnen bei 0 XP (Level 1)');
select pg_temp.ok((public.rpg_held_lesen() -> 'inventar') is not null and (public.rpg_held_lesen() -> 'skills' ->> 'staerke') is not null, 'Inventar und die vier Skills bleiben erhalten');
select pg_temp.fehler('select public.rpg_held_skill_gutschrift(''00000000-0000-0000-0000-0000000040a1'', 0, 0, 0, 0, 100, 100)', 'permission denied', 'Spieler schreiben sich keine XP gut');
reset role; set role service_role;
select pg_temp.ok((select (r ->> 'staerke')::bigint > 0 from (select public.rpg_held_skill_gutschrift('00000000-0000-0000-0000-0000000040a1', 0, 4, 0, 0) r) x), 'Alter Aufruf mit vier Werten geht weiter');
select pg_temp.ok((select r ->> 'lp' = '17' and r ->> 'defense' = '30' from (select public.rpg_held_skill_gutschrift('00000000-0000-0000-0000-0000000040a1', 0, 0, 0, 0, 17, 30) r) x), 'LP 17 und Defense 30 XP gebucht');
select pg_temp.ok((select (r ->> 'lp')::bigint = 5017 from (select public.rpg_held_skill_gutschrift('00000000-0000-0000-0000-0000000040a1', 0, 0, 0, 0, 999999, 0) r) x), 'Je Aufruf höchstens 5000');
select pg_temp.fehler('select public.rpg_held_skill_gutschrift(''00000000-0000-0000-0000-0000000040a1'', 0, 0, 0, 0, -1, 0)', 'Negative', 'Negative XP abgelehnt');
reset role; update public.rpg_held set skill_lp = 699990 where user_id = '00000000-0000-0000-0000-0000000040a1'; set role service_role;
select pg_temp.ok((select (r ->> 'lp')::bigint = 700000 from (select public.rpg_held_skill_gutschrift('00000000-0000-0000-0000-0000000040a1', 0, 0, 0, 0, 500, 0) r) x), 'Höchstens Level 100 (700.000 LP-XP)');
select pg_temp.ok((select skill_lp = 0 and skill_defense = 0 from public.rpg_held where user_id = '00000000-0000-0000-0000-0000000040a2'), 'Bens Werte bleiben unberührt');
reset role;
\echo 044: alles in Ordnung
