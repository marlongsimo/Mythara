-- MYTHARA · RPG · Rückbau Migration 046: gespeicherte Lebenspunkte wieder entfernen (danach: nach einem Server-Neustart wieder voll).
begin;
drop function if exists public.rpg_held_lp_setzen(uuid, integer);
alter table public.rpg_held drop column if exists lp_stand;
commit;
