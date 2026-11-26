-- =====================================================================
-- MYTHARA · RPG · Migration 046: Splitterlande – aktuelle Lebenspunkte des eigenen Helden über Server-Neustarts hinweg
-- =====================================================================
-- Voraussetzung: Migration 045 ist eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht):
--   1) rpg_held bekommt eine Spalte lp_stand (jsonb, Standard null): {"lp": aktuelle Lebenspunkte, "z": Zeitpunkt in Sekunden}.
--      Beim nächsten Betreten eines Kampfgebiets rechnet der Server die Regeneration der vergangenen Zeit dazu (1 LP je 50 s).
--   2) rpg_held_lp_setzen(Spieler, LP): NUR der Spielserver (service_role) speichert den Stand (0–10 000; null = voll).
--
-- NUR FÜR DAS RPG. Rückbau: 046_rpg_held_lp_stand_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'quests') then raise exception 'Migration 045 (Quests) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists lp_stand jsonb;

create or replace function public.rpg_held_lp_setzen(p_user uuid, p_lp integer)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_lp is not null and (p_lp < 0 or p_lp > 10000) then raise exception 'Unzulässige Lebenspunkte.'; end if;
  update public.rpg_held set lp_stand = case when p_lp is null then null else jsonb_build_object('lp', p_lp, 'z', extract(epoch from now())::bigint) end, updated_at = now()
    where user_id = p_user;
  get diagnostics n = row_count; return n > 0;
end;
$$;
revoke all on function public.rpg_held_lp_setzen(uuid, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_lp_setzen(uuid, integer) to service_role;

commit;
