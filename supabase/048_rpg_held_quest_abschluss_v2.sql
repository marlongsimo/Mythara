-- =====================================================================
-- MYTHARA · RPG · Migration 048: Splitterlande – Questabschluss v2 (Kampf-XP, Berufe-XP, Questpunkte)
-- =====================================================================
-- Voraussetzung: Migration 045 (Queststand) ist eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht oder geändert):
--   1) rpg_held bekommt eine Spalte questpunkte (integer, Standard 0, nie negativ): die Summe der Questpunkte des Helden.
--   2) rpg_held_lesen() liefert zusätzlich {questpunkte} (alles andere wie in 045).
--   3) rpg_held_quest_abschluss_v2(Spieler, Quest, Kampf-XP, Berufe-XP, Questpunkte): NUR der Spielserver (service_role).
--      Schließt den Quest ab und schreibt die ganze Belohnung in derselben Anweisung gut – genau einmal. Ist der Quest schon
--      abgeschlossen, passiert nichts (Rückgabe false).
--        p_xp      {"geschick": n, "staerke": n, "fernkampf": n, "magie": n, "lp": n, "defense": n} – wie bisher (045)
--        p_berufe  {"schmieden": n, "holzfaellerei": n, …} – in rpg_held.inventar.berufe (dort führt der Server die Berufe-XP)
--        p_punkte  Questpunkte, kommen zu rpg_held.questpunkte dazu
--      Grenzen: höchstens 1000 XP je Skill und Beruf, höchstens 10 Questpunkte je Quest; negative Werte und unbekannte Kampfskills
--      werden abgelehnt. Berufe-XP nur, wenn der Held schon ein Inventar hat (sonst legt der Server es an und bucht selbst).
--   Die alte Funktion rpg_held_quest_abschluss (045) bleibt unverändert bestehen.
--
-- NUR FÜR DAS RPG. Rückbau: 048_rpg_held_quest_abschluss_v2_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'quests') then raise exception 'Migration 045 (Quests) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists questpunkte integer not null default 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'rpg_held_questpunkte_check') then
    alter table public.rpg_held add constraint rpg_held_questpunkte_check check (questpunkte >= 0);
  end if;
end $$;

create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie),
                            'skills', jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie,
                                                         'lp', skill_lp, 'defense', skill_defense),
                            'inventar', inventar, 'quests', quests, 'questpunkte', questpunkte)
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;

create or replace function public.rpg_held_quest_abschluss_v2(p_user uuid, p_quest text, p_xp jsonb, p_berufe jsonb, p_punkte integer)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare
  c_je constant integer := 1000;
  c_punkte constant integer := 10;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));
  c_beruf_max constant bigint := 200000000;
  x jsonb := coalesce(p_xp, '{}'::jsonb);
  b jsonb := coalesce(p_berufe, '{}'::jsonb);
  k text; v jsonb; berufe jsonb := '{}'::jsonb; n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_quest is null or p_quest !~ '^[a-z0-9_]{1,40}$' then raise exception 'Unbekannte Quest-ID.'; end if;
  if jsonb_typeof(x) <> 'object' or jsonb_typeof(b) <> 'object' then raise exception 'XP müssen als Objekt kommen.'; end if;
  if coalesce(p_punkte, 0) < 0 then raise exception 'Negative Questpunkte sind nicht erlaubt.'; end if;
  for k, v in select * from jsonb_each(x) loop
    if k not in ('geschick', 'staerke', 'fernkampf', 'magie', 'lp', 'defense') then raise exception 'Unbekannter Kampfskill: %', k; end if;
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  end loop;
  for k, v in select * from jsonb_each(b) loop
    if k !~ '^[a-z]{3,20}$' then raise exception 'Unbekannter Beruf: %', k; end if;
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
    berufe := berufe || jsonb_build_object(k, least(floor((v #>> '{}')::numeric), c_je));
  end loop;
  update public.rpg_held h set
      quests          = jsonb_set(quests, array[p_quest], jsonb_build_object('s', 'fertig', 'z', extract(epoch from now())::bigint)),
      skill_geschick  = least(c_max, skill_geschick  + least(floor(coalesce((x ->> 'geschick')::numeric, 0)),  c_je)),
      skill_staerke   = least(c_max, skill_staerke   + least(floor(coalesce((x ->> 'staerke')::numeric, 0)),   c_je)),
      skill_fernkampf = least(c_max, skill_fernkampf + least(floor(coalesce((x ->> 'fernkampf')::numeric, 0)), c_je)),
      skill_magie     = least(c_max, skill_magie     + least(floor(coalesce((x ->> 'magie')::numeric, 0)),     c_je)),
      skill_lp        = least(700000, skill_lp       + least(floor(coalesce((x ->> 'lp')::numeric, 0)),        c_je)),
      skill_defense   = least(1400000, skill_defense + least(floor(coalesce((x ->> 'defense')::numeric, 0)),   c_je)),
      inventar        = case when h.inventar is null or berufe = '{}'::jsonb then h.inventar
                             else jsonb_set(h.inventar, '{berufe}', coalesce((select jsonb_object_agg(key, value) from (
                                    select key, to_jsonb(least(c_beruf_max, coalesce((h.inventar -> 'berufe' ->> key)::bigint, 0) + (value #>> '{}')::bigint)) as value
                                    from jsonb_each(berufe)
                                    union all
                                    select key, value from jsonb_each(case when jsonb_typeof(h.inventar -> 'berufe') = 'object' then h.inventar -> 'berufe' else '{}'::jsonb end)
                                    where not berufe ? key) t), '{}'::jsonb)) end,
      questpunkte     = questpunkte + least(coalesce(p_punkte, 0), c_punkte),
      updated_at      = now()
    where user_id = p_user and coalesce(quests -> p_quest ->> 's', '') <> 'fertig';
  get diagnostics n = row_count; return n > 0;  -- false: schon abgeschlossen (keine zweite Belohnung) oder kein Held
end;
$$;
revoke all on function public.rpg_held_quest_abschluss_v2(uuid, text, jsonb, jsonb, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_quest_abschluss_v2(uuid, text, jsonb, jsonb, integer) to service_role;

commit;
