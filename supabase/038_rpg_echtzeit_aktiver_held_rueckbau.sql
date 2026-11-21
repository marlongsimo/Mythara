-- Rückbau von Migration 038 (aktiver Held der Splitterlande). Entfernt nur, was 038 angelegt hat.
begin;
drop function if exists public.rpg_echtzeit_held_setzen(uuid, text);
drop function if exists public.rpg_echtzeit_mein_held();
drop table if exists public.rpg_echtzeit_aktiver_held;
commit;
