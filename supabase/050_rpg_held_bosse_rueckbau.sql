-- MYTHARA · RPG · Rückbau Migration 050: Bosszähler entfernen (die gezählten Siege und Bestzeiten gehen dabei verloren).
begin;
drop function if exists public.rpg_held_bosse_lesen();
drop function if exists public.rpg_held_boss_sieg(uuid, text, numeric);
drop table if exists public.rpg_held_bosse;
commit;
