-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 033 (Helden freigeben, Start-Angebot)
-- Entfernt die Funktionen und die drei Tabellen dieser Migration. Ein schon freigegebener Held bleibt im Heldenkatalog,
-- seine Skins bleiben im Skin-Katalog, und gekaufte Helden, Skins und Erfahrungspakete bleiben bei den Konten.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
drop function if exists public.rpg_launch_buy(text);
drop function if exists public.rpg_launch_list();
drop function if exists public.rpg_admin_hero_release(text);
drop function if exists public.rpg_admin_hero_plan();
drop function if exists public.rpg_hero_katalog();
do $$ begin if to_regclass('public.rpg_launch_offers') is not null then drop function if exists public.rpg_launch_einzeln(public.rpg_launch_offers); end if; end $$;
drop table if exists public.rpg_launch_owned;
drop table if exists public.rpg_launch_offers;
drop table if exists public.rpg_hero_geplant;
commit;
