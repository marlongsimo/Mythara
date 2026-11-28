-- MYTHARA · RPG · Rückbau Migration 049: die Funktion zum Nachführen der Questpunkte entfernen.
-- Die nachgetragenen Werte in rpg_held.questpunkte bleiben (der Spielserver berechnet die Punkte ohnehin aus dem Queststand).
begin;
drop function if exists public.rpg_held_questpunkte_setzen(uuid, integer);
commit;
