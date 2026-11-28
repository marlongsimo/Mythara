-- =====================================================================
-- MYTHARA · RPG · Migration 044: Splitterlande – Skills „Lebenspunkte“ und „Defense“ des eigenen Helden
-- =====================================================================
-- Voraussetzung: Migrationen 042 (vier Skills) und 043 (Inventar) sind eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht):
--   1) rpg_held bekommt zwei Spalten skill_lp und skill_defense (ganze Zahlen ≥ 0, Start 0 = Level 1).
--   2) rpg_held_lesen() liefert in {skills} zusätzlich lp und defense (alles andere wie in 043, inkl. inventar).
--   3) rpg_held_skill_gutschrift bekommt zwei weitere Werte p_lp und p_defense (Standard 0). Die alte Fassung mit vier Werten
--      wird dafür ersetzt (dieselben Aufrufe mit vier Werten funktionieren weiter). NUR der Spielserver (service_role) darf sie aufrufen.
--      Der Server zählt die XP selbst: LP 1 XP je tatsächlich verursachtem Schadenspunkt, Defense 10 XP je Block.
--      Je Aufruf höchstens 5000 je Skill; gesamt höchstens Level 100 (LP 700.000, Defense 1.400.000).
--
-- NUR FÜR DAS RPG. Rückbau: 044_rpg_held_lp_defense_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'skill_geschick') then raise exception 'Migration 042 (Skills v2) fehlt.'; end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'inventar') then raise exception 'Migration 043 (Inventar) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists skill_lp      bigint not null default 0 check (skill_lp      >= 0);
alter table public.rpg_held add column if not exists skill_defense bigint not null default 0 check (skill_defense >= 0);

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

-- alte Fassung (vier Werte) ersetzen: zwei Fassungen nebeneinander könnte die Schnittstelle nicht unterscheiden
drop function if exists public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer);
create or replace function public.rpg_held_skill_gutschrift(p_user uuid, p_geschick integer, p_staerke integer, p_fernkampf integer, p_magie integer,
                                                            p_lp integer default 0, p_defense integer default 0)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c_je_aufruf constant integer := 5000;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));  -- kumulierte XP für Level 100 (Kampfskills)
  c_max_lp constant bigint := 700000;                                    -- LP Level 100
  c_max_defense constant bigint := 1400000;                              -- Defense Level 100
  v jsonb;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if coalesce(p_geschick, 0) < 0 or coalesce(p_staerke, 0) < 0 or coalesce(p_fernkampf, 0) < 0 or coalesce(p_magie, 0) < 0
     or coalesce(p_lp, 0) < 0 or coalesce(p_defense, 0) < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  update public.rpg_held set
      skill_geschick  = least(c_max, skill_geschick  + least(coalesce(p_geschick, 0),  c_je_aufruf)),
      skill_staerke   = least(c_max, skill_staerke   + least(coalesce(p_staerke, 0),   c_je_aufruf)),
      skill_fernkampf = least(c_max, skill_fernkampf + least(coalesce(p_fernkampf, 0), c_je_aufruf)),
      skill_magie     = least(c_max, skill_magie     + least(coalesce(p_magie, 0),     c_je_aufruf)),
      skill_lp        = least(c_max_lp, skill_lp     + least(coalesce(p_lp, 0),        c_je_aufruf)),
      skill_defense   = least(c_max_defense, skill_defense + least(coalesce(p_defense, 0), c_je_aufruf)),
      updated_at      = now()
    where user_id = p_user
    returning jsonb_build_object('geschick', skill_geschick, 'staerke', skill_staerke, 'fernkampf', skill_fernkampf, 'magie', skill_magie,
                                 'lp', skill_lp, 'defense', skill_defense) into v;
  return v;  -- null, wenn der Spieler noch keinen Helden hat
end;
$$;
revoke all on function public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_skill_gutschrift(uuid, integer, integer, integer, integer, integer, integer) to service_role;

commit;
