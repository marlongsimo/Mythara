-- MYTHARA · RPG · Rückbau Migration 044: Skills LP und Defense wieder entfernen (Funktionen wie in 043).
-- ACHTUNG: löscht die gesammelten LP- und Defense-XP aller Helden. Nur ausführen, wenn das wirklich gewollt ist.
begin;
drop function if exists public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer, integer, integer);
create or replace function public.rpg_held_skill_gutschrift(p_user uuid, p_geschick integer, p_staerke integer, p_fernkampf integer, p_magie integer)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c_je_aufruf constant integer := 5000;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));
  v jsonb;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if coalesce(p_geschick, 0) < 0 or coalesce(p_staerke, 0) < 0 or coalesce(p_fernkampf, 0) < 0 or coalesce(p_magie, 0) < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  update public.rpg_held set
      skill_geschick  = least(c_max, skill_geschick  + least(coalesce(p_geschick, 0),  c_je_aufruf)),
      skill_staerke   = least(c_max, skill_staerke   + least(coalesce(p_staerke, 0),   c_je_aufruf)),
      skill_fernkampf = least(c_max, skill_fernkampf + least(coalesce(p_fernkampf, 0), c_je_aufruf)),
      skill_magie     = least(c_max, skill_magie     + least(coalesce(p_magie, 0),     c_je_aufruf)),
      updated_at      = now()
    where user_id = p_user
    returning jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie) into v;
  return v;
end;
$$;
revoke all on function public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer) to service_role;
create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie),
                            'skills', jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie),
                            'inventar', inventar)
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;
alter table public.rpg_held drop column if exists skill_lp, drop column if exists skill_defense;
commit;
