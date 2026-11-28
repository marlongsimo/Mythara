-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 050 (Bosszähler und Bestzeit). Voraussetzung: 040 ist eingespielt.
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000050a1', false), ('00000000-0000-0000-0000-0000000050b2', false) on conflict do nothing;
\ir ../050_rpg_held_bosse.sql
\ir ../050_rpg_held_bosse.sql
select pg_temp.ok(to_regclass('public.rpg_held_bosse') is not null, 'Tabelle rpg_held_bosse angelegt (zweimal eingespielt: unschädlich)');
set role service_role;
select pg_temp.ok((select public.rpg_held_boss_sieg('00000000-0000-0000-0000-0000000050a1', 'rotmantel', 95.27) = '{"siege": 1, "bestzeit": 95.3}'::jsonb), 'Erster Sieg: 1, Bestzeit 95,3 s');
select pg_temp.ok((select public.rpg_held_boss_sieg('00000000-0000-0000-0000-0000000050a1', 'rotmantel', 120) = '{"siege": 2, "bestzeit": 95.3}'::jsonb), 'Langsamer: Bestzeit bleibt');
select pg_temp.ok((select public.rpg_held_boss_sieg('00000000-0000-0000-0000-0000000050a1', 'rotmantel', 61.04) = '{"siege": 3, "bestzeit": 61.0}'::jsonb), 'Schneller: neue Bestzeit');
select pg_temp.ok((select public.rpg_held_boss_sieg('00000000-0000-0000-0000-0000000050a1', 'rotmantel', 0) = '{"siege": 4, "bestzeit": 61.0}'::jsonb), 'Dauer unbekannt (0): zählt, ändert die Bestzeit nicht');
select pg_temp.ok((select public.rpg_held_boss_sieg('00000000-0000-0000-0000-0000000050b2', 'oberster_rabenpriester', 0) = '{"siege": 1, "bestzeit": null}'::jsonb), 'Anderes Konto, anderer Boss: eigener Zähler, ohne Bestzeit');
select pg_temp.fehler('select public.rpg_held_boss_sieg(''00000000-0000-0000-0000-0000000050a1'', ''Rot Mantel'', 10)', 'Boss-ID', 'Unzulässige Boss-ID abgelehnt');
select pg_temp.fehler('select public.rpg_held_boss_sieg(''00000000-0000-0000-0000-0000000050a1'', ''rotmantel'', -1)', 'Kampfdauer', 'Negative Dauer abgelehnt');
select pg_temp.fehler('select public.rpg_held_boss_sieg(null, ''rotmantel'', 10)', 'Spieler fehlt', 'Ohne Spieler abgelehnt');
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000050a1', false);
select pg_temp.fehler('select public.rpg_held_boss_sieg(''00000000-0000-0000-0000-0000000050a1'', ''rotmantel'', 1)', 'permission denied', 'Spieler zählen ihre Siege nicht selbst');
select pg_temp.fehler('update public.rpg_held_bosse set siege = 999', 'permission denied', 'Spieler ändern ihre Zähler nicht');
select pg_temp.ok((select count(*) = 1 from public.rpg_held_bosse), 'Spieler sieht nur seine eigenen Zeilen');
select pg_temp.ok((select public.rpg_held_bosse_lesen() = '{"rotmantel": {"siege": 4, "bestzeit": 61.0}}'::jsonb), 'rpg_held_bosse_lesen: eigene Zähler');
reset role;
\ir ../050_rpg_held_bosse_rueckbau.sql
select pg_temp.ok(to_regclass('public.rpg_held_bosse') is null and not exists (select 1 from pg_proc where proname in ('rpg_held_boss_sieg', 'rpg_held_bosse_lesen')), 'Rückbau entfernt Tabelle und Funktionen');
\ir ../050_rpg_held_bosse.sql
select pg_temp.ok(to_regclass('public.rpg_held_bosse') is not null, 'Nach dem Rückbau wieder einspielbar');
\echo 050: alles in Ordnung
