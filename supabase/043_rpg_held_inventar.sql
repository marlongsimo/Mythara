-- =====================================================================
-- MYTHARA · RPG · Migration 043: Splitterlande – Inventar des eigenen Helden auf dem Server
-- =====================================================================
-- Voraussetzung: Migrationen 040, 041 und 042 sind eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht):
--   1) rpg_held bekommt die Spalte inventar (jsonb, leer = noch nie gespeichert → der Server legt es aus der Startwaffe an).
--      Inhalt: {"angelegt": {"waffe": "...", "brust": "...", "nebenhand": "..."}, "rucksack": ["...", ...]}
--   2) rpg_held_lesen() liefert zusätzlich {inventar}.
--   3) rpg_held_inventar_setzen(Spieler, Inventar): NUR der Spielserver (service_role) schreibt das Inventar.
--      Er prüft jede Aktion selbst (anlegen, ablegen, fallen lassen, aufheben); Spieler können ihr Inventar nicht selbst setzen.
--      Die Datenbank prüft zusätzlich die Form (Objekt mit angelegt und rucksack, höchstens 32 Rucksackplätze, höchstens 16 kB).
--
-- NUR FÜR DAS RPG. Rückbau: 043_rpg_held_inventar_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_held') is null then raise exception 'Migration 040 (rpg_held) fehlt.'; end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'rpg_held' and column_name = 'skill_geschick') then raise exception 'Migration 042 (Skills v2) fehlt.'; end if;
end $$;

alter table public.rpg_held add column if not exists inventar jsonb;

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

create or replace function public.rpg_held_inventar_setzen(p_user uuid, p_inventar jsonb)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_inventar is null or jsonb_typeof(p_inventar) <> 'object' or jsonb_typeof(p_inventar -> 'angelegt') <> 'object' or jsonb_typeof(p_inventar -> 'rucksack') <> 'array' then
    raise exception 'Inventar hat nicht die erwartete Form.'; end if;
  if jsonb_array_length(p_inventar -> 'rucksack') > 32 then raise exception 'Zu viele Rucksackplätze.'; end if;
  if pg_column_size(p_inventar) > 16384 then raise exception 'Inventar zu groß.'; end if;
  update public.rpg_held set inventar = p_inventar, updated_at = now() where user_id = p_user;
  get diagnostics n = row_count;
  return n > 0;  -- false, wenn der Spieler noch keinen Helden hat
end;
$$;
revoke all on function public.rpg_held_inventar_setzen(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.rpg_held_inventar_setzen(uuid, jsonb) to service_role;

commit;
