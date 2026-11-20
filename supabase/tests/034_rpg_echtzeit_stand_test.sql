-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 034 (Spielstand der Splitterlande).
\set ON_ERROR_STOP on
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000034a1', false), ('00000000-0000-0000-0000-0000000034a2', false), ('00000000-0000-0000-0000-0000000034a3', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000034a1', 'Ez_Anna'), ('00000000-0000-0000-0000-0000000034a2', 'Ez_Bert');
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000034a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated;
set role authenticated;
select pg_temp.als(1);
select pg_temp.fehler('select * from public.rpg_echtzeit_stand', 'permission denied', 'Die Tabelle ist nicht direkt lesbar');
select pg_temp.fehler('insert into public.rpg_echtzeit_stand (user_id) values (''00000000-0000-0000-0000-0000000034a1'')', 'permission denied', '… und nicht direkt beschreibbar');
select pg_temp.ok(public.rpg_echtzeit_laden() = '{"stand":{},"version":0}'::jsonb, 'Ohne Stand: leer, Version 0');
select pg_temp.fehler('select public.rpg_echtzeit_speichern(''[1]''::jsonb, 0)', 'ungültig', 'Kein Objekt: abgelehnt');
select pg_temp.fehler('select public.rpg_echtzeit_speichern(jsonb_build_object(''x'', (select string_agg(md5(i::text), '''') from generate_series(1, 4000) i)), 0)', 'zu groß', 'Zu großer Stand: abgelehnt');
select pg_temp.ok(public.rpg_echtzeit_speichern('{"kampagnen":1}'::jsonb, 0) = '{"ok":true,"version":1}'::jsonb, 'Erstes Speichern: Version 1');
select pg_temp.ok(public.rpg_echtzeit_speichern('{"kampagnen":2}'::jsonb, 1) = '{"ok":true,"version":2}'::jsonb, 'Speichern mit richtiger Version: Version 2');
select pg_temp.ok(public.rpg_echtzeit_speichern('{"kampagnen":0}'::jsonb, 1) @> '{"ok":false,"konflikt":true,"version":2,"stand":{"kampagnen":2}}'::jsonb, 'Veraltete Version: nichts überschrieben, neuerer Stand kommt zurück');
select pg_temp.ok(public.rpg_echtzeit_laden() @> '{"stand":{"kampagnen":2},"version":2}'::jsonb, 'Laden gibt den gespeicherten Stand');
select pg_temp.als(2);
select pg_temp.ok(public.rpg_echtzeit_laden() = '{"stand":{},"version":0}'::jsonb, 'Ein anderes Konto sieht den Stand nicht');
select pg_temp.ok(public.rpg_echtzeit_speichern('{"kampagnen":5}'::jsonb, 0)->>'version' = '1', '… und speichert seinen eigenen');
select pg_temp.als(1);
select pg_temp.ok(public.rpg_echtzeit_laden() @> '{"stand":{"kampagnen":2}}'::jsonb, 'Der erste Stand ist unberührt');
select pg_temp.als(3);
select pg_temp.fehler('select public.rpg_echtzeit_laden()', 'Spielerkonto', 'Gäste können nicht laden');
select pg_temp.fehler('select public.rpg_echtzeit_speichern(''{}''::jsonb, 0)', 'Spielerkonto', '… und nicht speichern');
reset role;
\echo 034: alles in Ordnung
