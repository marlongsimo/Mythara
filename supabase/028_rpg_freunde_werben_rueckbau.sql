-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 028 (Freunde werben)
-- Entfernt Trigger, Funktionen und die Tabelle rpg_referrals. Bereits vergebene Heldentoken bleiben bei den Konten.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
do $$ begin if to_regclass('public.rpg_ending_claims') is not null then drop trigger if exists rpg_referral_bei_ende on public.rpg_ending_claims; end if; end $$;
drop function if exists public.rpg_referral_status();
drop function if exists public.rpg_referral_set(text);
drop function if exists public.rpg_referral_belohnen();
drop function if exists public.rpg_referral_max();
drop function if exists public.rpg_referral_frist();
drop table if exists public.rpg_referrals;
commit;
