-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 038 (aktiver Held der Splitterlande).
\set ON_ERROR_STOP on
create function pg_temp.als(p text) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000038a1', false), ('00000000-0000-0000-0000-0000000038a2', false), ('00000000-0000-0000-0000-0000000038a3', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000038a1', 'Anna38'), ('00000000-0000-0000-0000-0000000038a2', 'Ben38');
set role authenticated; select pg_temp.als('00000000-0000-0000-0000-0000000038a1');
select pg_temp.ok(public.rpg_echtzeit_mein_held() is null, 'Noch kein Held gewählt: null');
select pg_temp.fehler('select * from public.rpg_echtzeit_aktiver_held', 'permission denied', 'Die Tabelle ist nicht direkt lesbar');
select pg_temp.fehler('select public.rpg_echtzeit_held_setzen(''00000000-0000-0000-0000-0000000038a1'', ''assassine'')', 'permission denied', 'Spieler können ihren Helden nicht selbst setzen (nur der Server)');
reset role; set role service_role;
select pg_temp.ok((public.rpg_echtzeit_held_setzen('00000000-0000-0000-0000-0000000038a1', 'assassine') ->> 'ok')::boolean, 'Server setzt Annas Held');
select public.rpg_echtzeit_held_setzen('00000000-0000-0000-0000-0000000038a1', 'kopfgeldjaeger');
select pg_temp.fehler('select public.rpg_echtzeit_held_setzen(''00000000-0000-0000-0000-0000000038a1'', ''Bad Name!'')', 'ungültig', 'Ungültiger Heldenname: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_held_setzen(''00000000-0000-0000-0000-0000000038a3'', ''assassine'')', 'Spielerkonto', 'Gäste haben keinen aktiven Helden');
reset role; set role authenticated; select pg_temp.als('00000000-0000-0000-0000-0000000038a1');
select pg_temp.ok(public.rpg_echtzeit_mein_held() = 'kopfgeldjaeger', 'Anna liest ihren Helden – der zweite Wechsel gilt');
select pg_temp.als('00000000-0000-0000-0000-0000000038a2'); select pg_temp.ok(public.rpg_echtzeit_mein_held() is null, 'Ben sieht nicht Annas Helden');
reset role;
\echo 038: alles in Ordnung
