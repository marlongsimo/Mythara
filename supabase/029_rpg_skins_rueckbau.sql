-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 029 (Helden-Skins)
-- Entfernt Funktionen und Tabellen der Skins. ACHTUNG: Gekaufte Skins gehen dabei verloren; die bezahlten
-- Seelensplitter werden nicht zurückgebucht.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
drop function if exists public.rpg_arena_skins(uuid);
drop function if exists public.rpg_skins_von(uuid);
drop function if exists public.rpg_skin_equip(text, text);
drop function if exists public.rpg_skin_buy(text);
drop function if exists public.rpg_skins();
drop table if exists public.rpg_skin_equipped;
drop table if exists public.rpg_skin_owned;
drop table if exists public.rpg_skin_items;
commit;
