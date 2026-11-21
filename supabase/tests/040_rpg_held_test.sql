-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 040 (der eigene Held).
\set ON_ERROR_STOP on
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
grant execute on all functions in schema pg_temp to authenticated, service_role;
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000040a1', false), ('00000000-0000-0000-0000-0000000040a2', false), ('00000000-0000-0000-0000-0000000040a3', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000040a1', 'Anna40'), ('00000000-0000-0000-0000-0000000040a2', 'Ben40');
set role authenticated;
select pg_temp.fehler('select * from public.rpg_held', 'permission denied', 'Spieler lesen die Tabelle nicht direkt');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok(public.rpg_held_lesen() is null, 'Ohne Helden: lesen liefert nichts (das Spiel schickt zum Heldeneditor)');
select pg_temp.ok((public.rpg_held_speichern('{"g":"mann","frisur":"zopf_eng","bart":"wikinger","haar":"orange","haut":"oliv"}', 'bogen') ->> 'waffe') = 'bogen', 'Anna legt ihren Helden an');
select pg_temp.ok((select public.rpg_held_lesen() -> 'aussehen' ->> 'frisur') = 'zopf_eng' and (select public.rpg_held_lesen() -> 'aussehen' ->> 'haar') = 'orange', 'und liest ihn wieder');
select public.rpg_held_speichern('{"g":"frau","frisur":"dutt_hoch","bart":"vollbart","haar":"schwarz","haut":"dunkel"}', 'stab');
select pg_temp.ok((select public.rpg_held_lesen() -> 'aussehen' ->> 'bart') = 'ohne' and (select public.rpg_held_lesen() ->> 'waffe') = 'stab', 'Ändern überschreibt; eine Frau hat keinen Bart');
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"mann","frisur":"dutt_hoch","haar":"schwarz","haut":"hell"}'', ''schwert'')', 'Frisur', 'Frauenfrisur beim Mann: abgelehnt');
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"mann","frisur":"glatze","haar":"lila","haut":"hell"}'', ''schwert'')', 'Haarfarbe', 'Unbekannte Haarfarbe: abgelehnt');
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"mann","frisur":"glatze","haar":"grau","haut":"blau"}'', ''schwert'')', 'Hautfarbe', 'Unbekannte Hautfarbe: abgelehnt');
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"mann","frisur":"glatze","haar":"grau","haut":"hell"}'', ''axt'')', 'Startwaffe', 'Unbekannte Startwaffe: abgelehnt');
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"ork","frisur":"glatze","haar":"grau","haut":"hell"}'', ''schwert'')', 'Geschlecht', 'Unbekanntes Geschlecht: abgelehnt');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a2', false);
select pg_temp.ok(public.rpg_held_lesen() is null, 'Ben sieht Annas Helden nicht als seinen');
select public.rpg_held_speichern('{"g":"mann","frisur":"glatze","bart":"ohne","haar":"grau","haut":"hell"}', 'schwert');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a1', false);
select pg_temp.ok((select public.rpg_held_lesen() ->> 'waffe') = 'stab', 'Bens Speichern ändert Annas Helden nicht');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000040a3', false);
select pg_temp.fehler('select public.rpg_held_speichern(''{"g":"mann","frisur":"glatze","haar":"grau","haut":"hell"}'', ''schwert'')', 'Spielerkonto', 'Gäste speichern keinen Helden im Konto (nur auf dem Gerät)');
select set_config('request.jwt.claim.sub', '', false);
reset role; set role anon;
select pg_temp.fehler('select public.rpg_held_lesen()', 'permission denied', 'Ohne Anmeldung: kein Zugriff');
reset role; set role service_role;
select pg_temp.ok((select count(*) = 2 from public.rpg_held), 'Der Spielserver liest alle Helden (für die Mitspieler)');
reset role;
\echo 040: alles in Ordnung
