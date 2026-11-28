-- MYTHARA · RPG · Rückbau Migration 043: Inventar auf dem Server wieder entfernen (rpg_held_lesen wie in 042).
-- ACHTUNG: löscht die gespeicherten Inventare aller Helden. Nur ausführen, wenn das wirklich gewollt ist.
begin;
drop function if exists public.rpg_held_inventar_setzen(uuid, jsonb);
create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie),
                            'skills', jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie))
  from public.rpg_held where user_id = auth.uid();
$$;
alter table public.rpg_held drop column if exists inventar;
commit;
