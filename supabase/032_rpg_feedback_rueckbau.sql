-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 032 (Feedback)
-- Entfernt Funktionen und die Tabelle rpg_feedback. ACHTUNG: Alle eingegangenen Nachrichten gehen dabei verloren.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
drop function if exists public.rpg_admin_feedback_read(uuid, boolean);
drop function if exists public.rpg_admin_feedback(boolean);
drop function if exists public.rpg_feedback_send(text, text, jsonb);
drop table if exists public.rpg_feedback;
commit;
