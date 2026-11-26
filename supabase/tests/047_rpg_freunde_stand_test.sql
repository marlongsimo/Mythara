-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 047 (Freundesliste für den Spielserver).
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000047a1', false), ('00000000-0000-0000-0000-0000000047b2', false), ('00000000-0000-0000-0000-0000000047c3', false), ('00000000-0000-0000-0000-0000000047d4', false);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000047a1', 'Anna47'), ('00000000-0000-0000-0000-0000000047b2', 'Ben47'), ('00000000-0000-0000-0000-0000000047c3', 'Cora47'), ('00000000-0000-0000-0000-0000000047d4', 'Dirk47');
insert into public.rpg_friendships (requester_id, addressee_id, status) values
  ('00000000-0000-0000-0000-0000000047a1', '00000000-0000-0000-0000-0000000047b2', 'accepted'),
  ('00000000-0000-0000-0000-0000000047c3', '00000000-0000-0000-0000-0000000047a1', 'accepted'),
  ('00000000-0000-0000-0000-0000000047a1', '00000000-0000-0000-0000-0000000047d4', 'pending');
insert into public.rpg_echtzeit_position (user_id, region, x, y, updated_at) values ('00000000-0000-0000-0000-0000000047b2', 'waldmark', 10, 10, now() - interval '3 hours');
set role authenticated;
select pg_temp.fehler('select public.rpg_freunde_von(''00000000-0000-0000-0000-0000000047a1'')', 'permission denied', 'Spieler rufen die Server-Liste nicht selbst ab');
reset role; set role service_role;
select pg_temp.ok(jsonb_array_length(public.rpg_freunde_von('00000000-0000-0000-0000-0000000047a1')) = 2, 'Anna hat zwei bestätigte Freunde (Ben, Cora) – die offene Anfrage an Dirk zählt nicht');
select pg_temp.ok((select string_agg(e ->> 'handle', ',') from jsonb_array_elements(public.rpg_freunde_von('00000000-0000-0000-0000-0000000047a1')) e) = 'Ben47,Cora47', 'Sortiert nach Name, in beide Richtungen (Anna fragte Ben, Cora fragte Anna)');
select pg_temp.ok((select (e ->> 'zuletzt') is not null from jsonb_array_elements(public.rpg_freunde_von('00000000-0000-0000-0000-0000000047a1')) e where e ->> 'handle' = 'Ben47'), 'Ben: zuletzt online aus der gemerkten Stelle');
select pg_temp.ok((select (e -> 'zuletzt') = 'null'::jsonb from jsonb_array_elements(public.rpg_freunde_von('00000000-0000-0000-0000-0000000047a1')) e where e ->> 'handle' = 'Cora47'), 'Cora: noch nie in der Welt → zuletzt null');
select pg_temp.ok(jsonb_array_length(public.rpg_freunde_von('00000000-0000-0000-0000-0000000047d4')) = 0, 'Dirk: offene Anfrage ist noch keine Freundschaft');
reset role;
\echo 047: alles in Ordnung
