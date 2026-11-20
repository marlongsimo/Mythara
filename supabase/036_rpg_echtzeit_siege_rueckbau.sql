-- MYTHARA · RPG · Rückbau von Migration 036 (gewonnene Kämpfe der Splitterlande).
-- ACHTUNG: löscht die vom Server eingetragenen Siege. EP, Seelensplitter und Spielstand bleiben.
begin;
drop function if exists public.rpg_echtzeit_sieg(uuid, text, text);
drop function if exists public.rpg_echtzeit_siege();
drop table if exists public.rpg_echtzeit_siege;
commit;
