-- =====================================================================
-- MYTHARA · RPG · Migration 041: Splitterlande – Skill-Erfahrung des eigenen Helden (Kampfregeln v1)
-- =====================================================================
-- Voraussetzung: Migration 040 (rpg_held) ist eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht):
--   1) rpg_held bekommt drei Spalten xp_staerke, xp_geschick, xp_magie (ganze Zahlen ≥ 0, Start 0 = Skilllevel 1).
--   2) rpg_held_lesen() liefert zusätzlich {xp: {staerke, geschick, magie}}.
--   3) rpg_held_xp_gutschrift(Spieler, Stärke, Geschick, Magie): NUR der Spielserver (service_role) schreibt Skill-XP gut.
--      Er zählt die XP selbst (2 XP je tatsächlich abgezogenem Lebenspunkt); je Aufruf höchstens 5000 je Skill,
--      gesamt höchstens die XP für Level 100. Spieler können ihre XP nicht selbst setzen.
--
-- NUR FÜR DAS RPG. Rückbau: 041_rpg_held_xp_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_held') is null then raise exception 'Migration 040 (rpg_held) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists xp_staerke  bigint not null default 0 check (xp_staerke  >= 0);
alter table public.rpg_held add column if not exists xp_geschick bigint not null default 0 check (xp_geschick >= 0);
alter table public.rpg_held add column if not exists xp_magie    bigint not null default 0 check (xp_magie    >= 0);

create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe,
                            'xp', jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie))
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;

create or replace function public.rpg_held_xp_gutschrift(p_user uuid, p_staerke integer, p_geschick integer, p_magie integer)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c_je_aufruf constant integer := 5000;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));  -- kumulierte XP für Level 100
  v jsonb;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if coalesce(p_staerke, 0) < 0 or coalesce(p_geschick, 0) < 0 or coalesce(p_magie, 0) < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  update public.rpg_held set
      xp_staerke  = least(c_max, xp_staerke  + least(coalesce(p_staerke, 0),  c_je_aufruf)),
      xp_geschick = least(c_max, xp_geschick + least(coalesce(p_geschick, 0), c_je_aufruf)),
      xp_magie    = least(c_max, xp_magie    + least(coalesce(p_magie, 0),    c_je_aufruf)),
      updated_at  = now()
    where user_id = p_user
    returning jsonb_build_object('staerke', xp_staerke, 'geschick', xp_geschick, 'magie', xp_magie) into v;
  return v;  -- null, wenn der Spieler noch keinen Helden hat
end;
$$;
revoke all on function public.rpg_held_xp_gutschrift(uuid, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_xp_gutschrift(uuid, integer, integer, integer) to service_role;

commit;
