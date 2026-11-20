-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 037 (Koop-Einladungen der Splitterlande).
\set ON_ERROR_STOP on
create function pg_temp.als(p text) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000037a1', false), ('00000000-0000-0000-0000-0000000037a2', false), ('00000000-0000-0000-0000-0000000037a3', false), ('00000000-0000-0000-0000-0000000037a4', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000037a1', 'Anna37'), ('00000000-0000-0000-0000-0000000037a2', 'Ben37'), ('00000000-0000-0000-0000-0000000037a3', 'Cora37');
insert into public.rpg_friendships (requester_id, addressee_id, status) values ('00000000-0000-0000-0000-0000000037a1', '00000000-0000-0000-0000-0000000037a2', 'accepted'), ('00000000-0000-0000-0000-0000000037a1', '00000000-0000-0000-0000-0000000037a3', 'pending');
set role authenticated; select pg_temp.als('00000000-0000-0000-0000-0000000037a1');
select pg_temp.fehler('select * from public.rpg_echtzeit_einladungen', 'permission denied', 'Die Tabelle ist nicht direkt lesbar');
select pg_temp.ok((public.rpg_echtzeit_einladen('Ben37', 'ABCDEF') ->> 'ok')::boolean, 'Anna lädt ihren Freund Ben ein');
select public.rpg_echtzeit_einladen('ben37', 'QWERTZ');
select pg_temp.fehler('select public.rpg_echtzeit_einladen(''Cora37'', ''ABCDEF'')', 'nur Freunde', 'Cora (Anfrage noch offen) kann nicht eingeladen werden');
select pg_temp.fehler('select public.rpg_echtzeit_einladen(''Ben37'', ''abc'')', 'ungültig', 'Ungültiger Code: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_einladen(''Anna37'', ''ABCDEF'')', 'nur Freunde', 'Sich selbst einladen: abgelehnt');
select pg_temp.ok(public.rpg_echtzeit_einladungen() = '[]'::jsonb, 'Anna hat selbst keine Einladungen');
select pg_temp.als('00000000-0000-0000-0000-0000000037a2');
select pg_temp.ok(jsonb_array_length(public.rpg_echtzeit_einladungen()) = 1 and public.rpg_echtzeit_einladungen() -> 0 ->> 'von' = 'Anna37' and public.rpg_echtzeit_einladungen() -> 0 ->> 'code' = 'QWERTZ', 'Ben sieht eine Einladung von Anna – die neue ersetzt die alte');
select pg_temp.als('00000000-0000-0000-0000-0000000037a3'); select public.rpg_echtzeit_einladung_weg((select (x ->> 'id')::uuid from jsonb_array_elements((select public.rpg_echtzeit_einladungen())) x limit 1));
select pg_temp.als('00000000-0000-0000-0000-0000000037a2');
select pg_temp.ok(jsonb_array_length(public.rpg_echtzeit_einladungen()) = 1, 'Fremde können Bens Einladung nicht entfernen');
select public.rpg_echtzeit_einladung_weg(((public.rpg_echtzeit_einladungen() -> 0) ->> 'id')::uuid);
select pg_temp.ok(public.rpg_echtzeit_einladungen() = '[]'::jsonb, 'Ben entfernt seine Einladung');
select pg_temp.als('00000000-0000-0000-0000-0000000037a4'); select pg_temp.fehler('select public.rpg_echtzeit_einladen(''Ben37'', ''ABCDEF'')', 'Spielerkonto', 'Gäste können nicht einladen');
reset role;
\echo 037: alles in Ordnung
