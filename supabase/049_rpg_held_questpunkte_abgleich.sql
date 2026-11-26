-- =====================================================================
-- MYTHARA · RPG · Migration 049: Splitterlande – Questpunkte aus dem Queststand nachführen
-- =====================================================================
-- Voraussetzung: Migration 048 (Spalte rpg_held.questpunkte) ist eingespielt.
--
-- Die Questpunkte leiten sich aus dem Queststand ab (jede abgeschlossene Quest zählt ihre Punkte, festgelegt in den Quest-Daten
-- des Spiels). rpg_held.questpunkte ist die gespeicherte Kopie davon. Was diese Migration tut (nichts wird gelöscht):
--   1) rpg_held_questpunkte_setzen(Spieler, Punkte): NUR der Spielserver (service_role). Setzt die gespeicherte Kopie auf den Wert,
--      den der Server aus dem Queststand berechnet hat. Höchstens 10 Punkte je abgeschlossener Quest, nie negativ.
--   2) Einmaliges Nachtragen: Wer Quests vor Migration 048 abgeschlossen hat, bekommt je abgeschlossener Quest 1 Punkt
--      (so viel geben alle bisherigen Quests). Bestehende Werte werden nie verringert.
--
-- NUR FÜR DAS RPG. Rückbau: 049_rpg_held_questpunkte_abgleich_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'questpunkte') then raise exception 'Migration 048 (Questpunkte) fehlt.'; end if;
end $$;

create or replace function public.rpg_held_questpunkte_setzen(p_user uuid, p_punkte integer)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer; fertig integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_punkte is null or p_punkte < 0 then raise exception 'Unzulässige Questpunkte.'; end if;
  select count(*) into fertig from public.rpg_held h, jsonb_each(h.quests) q where h.user_id = p_user and q.value ->> 's' = 'fertig';
  if p_punkte > 10 * coalesce(fertig, 0) then raise exception 'Mehr Questpunkte als abgeschlossene Quests.'; end if;
  update public.rpg_held set questpunkte = p_punkte, updated_at = now() where user_id = p_user and questpunkte <> p_punkte;
  get diagnostics n = row_count; return n > 0;
end;
$$;
revoke all on function public.rpg_held_questpunkte_setzen(uuid, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_questpunkte_setzen(uuid, integer) to service_role;

-- Einmal nachtragen: je abgeschlossener Quest 1 Punkt, nie weniger als bisher
update public.rpg_held h set questpunkte = f.n
  from (select user_id, count(*)::integer as n from public.rpg_held, jsonb_each(quests) q where q.value ->> 's' = 'fertig' group by user_id) f
  where h.user_id = f.user_id and h.questpunkte < f.n;

commit;
