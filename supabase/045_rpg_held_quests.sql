-- =====================================================================
-- MYTHARA · RPG · Migration 045: Splitterlande – Queststand des eigenen Helden (Quest 01 „Die gesperrte Straße“ und folgende)
-- =====================================================================
-- Voraussetzung: Migrationen 042–044 sind eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht):
--   1) rpg_held bekommt eine Spalte quests (jsonb, Standard {}): je Quest-ID der Stand, z. B. {"die_gesperrte_strasse": {"s": "wachen"}}.
--   2) rpg_held_lesen() liefert zusätzlich {quests} (alles andere wie in 044).
--   3) rpg_held_quest_setzen(Spieler, Quest, Stand): NUR der Spielserver (service_role) setzt einen Queststand.
--      Ein abgeschlossener Quest („fertig“) wird nie wieder geändert.
--   4) rpg_held_quest_abschluss(Spieler, Quest, XP je Skill): NUR der Spielserver. Schließt den Quest ab und schreibt die Belohnung
--      in derselben Anweisung gut – genau einmal. Ist der Quest schon abgeschlossen, passiert nichts (Rückgabe false).
--      Je Skill höchstens 1000 XP Belohnung, gesamt höchstens Level 100.
--
-- NUR FÜR DAS RPG. Rückbau: 045_rpg_held_quests_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'skill_lp') then raise exception 'Migration 044 (LP und Defense) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists quests jsonb not null default '{}'::jsonb;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'rpg_held_quests_form') then
    alter table public.rpg_held add constraint rpg_held_quests_form check (jsonb_typeof(quests) = 'object' and pg_column_size(quests) <= 16384);
  end if;
end $$;

create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie),
                            'skills', jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie,
                                                         'lp', skill_lp, 'defense', skill_defense),
                            'inventar', inventar, 'quests', quests)
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;

create or replace function public.rpg_held_quest_setzen(p_user uuid, p_quest text, p_stand text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_quest is null or p_quest !~ '^[a-z0-9_]{1,40}$' then raise exception 'Unbekannte Quest-ID.'; end if;
  if p_stand is null or p_stand !~ '^[a-z0-9_]{1,24}$' or p_stand = 'fertig' then raise exception 'Unzulässiger Stand (Abschluss nur über rpg_held_quest_abschluss).'; end if;
  update public.rpg_held set quests = jsonb_set(quests, array[p_quest], jsonb_build_object('s', p_stand, 'z', extract(epoch from now())::bigint)), updated_at = now()
    where user_id = p_user and coalesce(quests -> p_quest ->> 's', '') <> 'fertig';
  get diagnostics n = row_count; return n > 0;
end;
$$;
revoke all on function public.rpg_held_quest_setzen(uuid, text, text) from public, anon, authenticated;
grant execute on function public.rpg_held_quest_setzen(uuid, text, text) to service_role;

create or replace function public.rpg_held_quest_abschluss(p_user uuid, p_quest text, p_geschick integer, p_staerke integer, p_fernkampf integer, p_magie integer, p_lp integer, p_defense integer)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare
  c_je constant integer := 1000;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));
  n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_quest is null or p_quest !~ '^[a-z0-9_]{1,40}$' then raise exception 'Unbekannte Quest-ID.'; end if;
  if least(coalesce(p_geschick, 0), coalesce(p_staerke, 0), coalesce(p_fernkampf, 0), coalesce(p_magie, 0), coalesce(p_lp, 0), coalesce(p_defense, 0)) < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  update public.rpg_held set
      quests          = jsonb_set(quests, array[p_quest], jsonb_build_object('s', 'fertig', 'z', extract(epoch from now())::bigint)),
      skill_geschick  = least(c_max, skill_geschick  + least(coalesce(p_geschick, 0),  c_je)),
      skill_staerke   = least(c_max, skill_staerke   + least(coalesce(p_staerke, 0),   c_je)),
      skill_fernkampf = least(c_max, skill_fernkampf + least(coalesce(p_fernkampf, 0), c_je)),
      skill_magie     = least(c_max, skill_magie     + least(coalesce(p_magie, 0),     c_je)),
      skill_lp        = least(700000, skill_lp       + least(coalesce(p_lp, 0),        c_je)),
      skill_defense   = least(1400000, skill_defense + least(coalesce(p_defense, 0),   c_je)),
      updated_at      = now()
    where user_id = p_user and coalesce(quests -> p_quest ->> 's', '') <> 'fertig';
  get diagnostics n = row_count; return n > 0;  -- false: schon abgeschlossen (keine zweite Belohnung) oder kein Held
end;
$$;
revoke all on function public.rpg_held_quest_abschluss(uuid, text, integer, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_quest_abschluss(uuid, text, integer, integer, integer, integer, integer, integer) to service_role;

commit;
