-- MYTHARA · RPG · Rückbau Migration 045: Queststand wieder entfernen (rpg_held_lesen wie in 044).
-- ACHTUNG: löscht den Queststand aller Helden (bereits gutgeschriebene XP bleiben). Nur ausführen, wenn das wirklich gewollt ist.
begin;
drop function if exists public.rpg_held_quest_abschluss(uuid, text, integer, integer, integer, integer, integer, integer);
drop function if exists public.rpg_held_quest_setzen(uuid, text, text);
create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie),
                            'skills', jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie,
                                                         'lp', skill_lp, 'defense', skill_defense),
                            'inventar', inventar)
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;
alter table public.rpg_held drop constraint if exists rpg_held_quests_form;
alter table public.rpg_held drop column if exists quests;
commit;
