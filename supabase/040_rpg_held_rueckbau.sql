-- MYTHARA · RPG · Rückbau von Migration 040 (der eigene Held). Entfernt nur, was 040 angelegt hat.
begin;
drop function if exists public.rpg_held_speichern(jsonb, text);
drop function if exists public.rpg_held_lesen();
drop table if exists public.rpg_held;
commit;
