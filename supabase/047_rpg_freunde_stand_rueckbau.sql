-- MYTHARA · RPG · Rückbau von Migration 047: entfernt nur die Funktion rpg_freunde_von (keine Daten betroffen).
begin;
drop function if exists public.rpg_freunde_von(uuid);
commit;
