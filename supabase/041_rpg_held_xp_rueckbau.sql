-- MYTHARA · RPG · Rückbau Migration 041: Skill-Erfahrung wieder entfernen (rpg_held_lesen wie in 040).
-- ACHTUNG: löscht die gesammelten Skill-XP aller Helden. Nur ausführen, wenn das wirklich gewollt ist.
begin;
drop function if exists public.rpg_held_xp_gutschrift(uuid, integer, integer, integer);
create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe)
  from public.rpg_held where user_id = auth.uid();
$$;
alter table public.rpg_held drop column if exists xp_staerke, drop column if exists xp_geschick, drop column if exists xp_magie;
commit;
