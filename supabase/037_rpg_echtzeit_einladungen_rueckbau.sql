-- Rückbau von Migration 037 (Koop-Einladungen der Splitterlande). Entfernt nur, was 037 angelegt hat.
begin;
drop function if exists public.rpg_echtzeit_einladung_weg(uuid);
drop function if exists public.rpg_echtzeit_einladungen();
drop function if exists public.rpg_echtzeit_einladen(text, text);
drop table if exists public.rpg_echtzeit_einladungen;
commit;
