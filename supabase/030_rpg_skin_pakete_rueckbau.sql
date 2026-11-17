-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 030 (Skin-Pakete)
-- Entfernt Pakete und ihre Funktionen. Die über ein Paket gekauften Skins bleiben bei den Konten.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
drop function if exists public.rpg_skin_bundle_buy(text);
drop function if exists public.rpg_skin_bundles_list();
drop table if exists public.rpg_skin_bundle_owned;
drop table if exists public.rpg_skin_bundle_items;
drop table if exists public.rpg_skin_bundles;
commit;
