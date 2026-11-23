-- =====================================================================
-- MYTHARA · RPG · Migration 047: Splitterlande – Freundesliste für den Spielserver (online, zuletzt online, Teleport)
-- =====================================================================
-- Voraussetzung: Migrationen 003 (Freundschaften) und 039 (gemerkte Stelle) sind eingespielt.
--
-- Was diese Migration tut (nur eine neue Funktion, keine Tabelle wird geändert, nichts gelöscht):
--   rpg_freunde_von(Spieler): NUR für den Spielserver (service_role). Liefert die bestätigten Freunde eines Spielers:
--   [{ "user_id", "handle", "zuletzt" }] – „zuletzt“ ist der Zeitpunkt der zuletzt gemerkten Stelle in der Welt (rpg_echtzeit_position,
--   wird beim Gehen und alle zwei Minuten geschrieben), sonst null. Blockierte, offene und abgelehnte Anfragen gehören nicht dazu.
--   Der Server prüft damit, ob zwei Spieler befreundet sind, bevor er Online-Stand oder Teleport zu einem Freund erlaubt.
--   Anfragen stellen und beantworten die Spieler weiter selbst mit rpg_request_friend / rpg_answer_friend (Migration 003).
--
-- NUR FÜR DAS RPG. Rückbau: 047_rpg_freunde_stand_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_friendships') is null then raise exception 'Migration 003 (Freunde) fehlt.'; end if;
  if to_regclass('public.rpg_echtzeit_position') is null then raise exception 'Migration 039 (Position) fehlt.'; end if;
end $$;

create or replace function public.rpg_freunde_von(p_user uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('user_id', f.freund, 'handle', p.handle, 'zuletzt', pos.updated_at) order by lower(p.handle)), '[]'::jsonb)
  from (select case when requester_id = p_user then addressee_id else requester_id end as freund
          from public.rpg_friendships where status = 'accepted' and p_user in (requester_id, addressee_id)) f
  join public.rpg_profiles p on p.user_id = f.freund
  left join public.rpg_echtzeit_position pos on pos.user_id = f.freund;
$$;
revoke all on function public.rpg_freunde_von(uuid) from public, anon, authenticated;
grant execute on function public.rpg_freunde_von(uuid) to service_role;

commit;
