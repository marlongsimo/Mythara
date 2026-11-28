-- MYTHARA · RPG · Rückbau Migration 042: vier Skills (v2) wieder entfernen (rpg_held_lesen wie in 041).
-- ACHTUNG: löscht die gesammelten v2-Skill-XP aller Helden. Die v1-XP (041) bleiben. Nur ausführen, wenn das wirklich gewollt ist.
begin;
drop function if exists public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer);
create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie))
  from public.rpg_held where user_id = auth.uid();
$$;
alter table public.rpg_held drop column if exists skill_geschick, drop column if exists skill_staerke, drop column if exists skill_fernkampf, drop column if exists skill_magie;
commit;
