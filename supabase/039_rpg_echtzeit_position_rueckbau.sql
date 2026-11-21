-- Rückbau von Migration 039 (gemerkte Stelle der Splitterlande). Entfernt nur, was 039 angelegt hat.
begin;
drop function if exists public.rpg_echtzeit_position_setzen(uuid, text, double precision, double precision);
drop table if exists public.rpg_echtzeit_position;
commit;
