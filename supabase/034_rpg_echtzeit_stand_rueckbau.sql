-- MYTHARA · RPG · Rückbau von Migration 034 (Spielstand der Splitterlande).
-- ACHTUNG: löscht alle gespeicherten Spielstände der Splitterlande. Sonst wird nichts angefasst.
begin;
drop function if exists public.rpg_echtzeit_speichern(jsonb, integer);
drop function if exists public.rpg_echtzeit_laden();
drop table if exists public.rpg_echtzeit_stand;
commit;
