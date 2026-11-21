-- =====================================================================
-- MYTHARA · RPG · Migration 040: Splitterlande – der eigene Held (Heldeneditor)
-- =====================================================================
-- Voraussetzung: Migration 002 (Profile) ist eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_held: je Spielerkonto ein Held – Aussehen (Geschlecht, Frisur, Bart, Haarfarbe, Hautfarbe) und Startwaffe.
--      Kein direkter Tabellenzugriff für Spieler; der Spielserver liest mit dem Server-Schlüssel (er zeigt den Helden den Mitspielern).
--   2) rpg_held_lesen(): der eigene Held des angemeldeten Spielers (oder null, wenn er noch keinen angelegt hat).
--   3) rpg_held_speichern(Aussehen, Startwaffe): legt den eigenen Helden an oder ändert ihn. Nur für das eigene Konto (auth.uid()),
--      nur erlaubte Werte (dieselben wie realtime/shared/aussehen.ts – bei Änderungen beide anpassen).
--
-- NUR FÜR DAS RPG. Rückbau: 040_rpg_held_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
end $$;

create table if not exists public.rpg_held (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  geschlecht  text        not null check (geschlecht in ('mann', 'frau')),
  frisur      text        not null check (frisur ~ '^[a-z_]{2,20}$'),
  bart        text        not null default 'ohne' check (bart ~ '^[a-z_]{2,20}$'),
  haarfarbe   text        not null check (haarfarbe in ('schwarz', 'dunkelbraun', 'hellbraun', 'grau', 'orange')),
  hautfarbe   text        not null check (hautfarbe in ('hell', 'mittel', 'oliv', 'braun', 'dunkel')),
  waffe       text        not null check (waffe in ('schwert', 'bogen', 'stab')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.rpg_held enable row level security;
revoke all on public.rpg_held from anon, authenticated;
grant select on public.rpg_held to service_role;  -- der Spielserver liest die Helden beim Anmelden (REST mit Server-Schlüssel)

create or replace function public.rpg_held_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('aussehen', jsonb_build_object('g', geschlecht, 'frisur', frisur, 'bart', bart, 'haar', haarfarbe, 'haut', hautfarbe), 'waffe', waffe)
  from public.rpg_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_lesen() from public, anon;
grant execute on function public.rpg_held_lesen() to authenticated;

create or replace function public.rpg_held_speichern(p_aussehen jsonb, p_waffe text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_g text := p_aussehen ->> 'g'; v_frisur text := p_aussehen ->> 'frisur'; v_bart text := coalesce(p_aussehen ->> 'bart', 'ohne');
  v_haar text := p_aussehen ->> 'haar'; v_haut text := p_aussehen ->> 'haut';
begin
  if v_user is null or not public.rpg_ist_konto(v_user) then raise exception 'Nur mit Spielerkonto.'; end if;
  if v_g is null or v_g not in ('mann', 'frau') then raise exception 'Geschlecht ungültig.'; end if;
  if v_g = 'mann' and coalesce(v_frisur, '') not in ('glatze', 'militaer', 'undercut_bun', 'zerzaust', 'zopf_eng', 'scheitel') then raise exception 'Frisur ungültig.'; end if;
  if v_g = 'frau' and coalesce(v_frisur, '') not in ('glatze', 'dutt_hoch', 'wuschel_hoch', 'pixie', 'zopf_wild', 'seitenbob') then raise exception 'Frisur ungültig.'; end if;
  if v_g = 'frau' then v_bart := 'ohne'; end if;
  if v_bart not in ('ohne', 'stoppeln', 'vollbart', 'hufeisen', 'schnurrbart', 'wikinger') then raise exception 'Bart ungültig.'; end if;
  if coalesce(v_haar, '') not in ('schwarz', 'dunkelbraun', 'hellbraun', 'grau', 'orange') then raise exception 'Haarfarbe ungültig.'; end if;
  if coalesce(v_haut, '') not in ('hell', 'mittel', 'oliv', 'braun', 'dunkel') then raise exception 'Hautfarbe ungültig.'; end if;
  if coalesce(p_waffe, '') not in ('schwert', 'bogen', 'stab') then raise exception 'Startwaffe ungültig.'; end if;
  insert into public.rpg_held (user_id, geschlecht, frisur, bart, haarfarbe, hautfarbe, waffe) values (v_user, v_g, v_frisur, v_bart, v_haar, v_haut, p_waffe)
    on conflict (user_id) do update set geschlecht = excluded.geschlecht, frisur = excluded.frisur, bart = excluded.bart,
      haarfarbe = excluded.haarfarbe, hautfarbe = excluded.hautfarbe, waffe = excluded.waffe, updated_at = now();
  return public.rpg_held_lesen();
end;
$$;
revoke all on function public.rpg_held_speichern(jsonb, text) from public, anon;
grant execute on function public.rpg_held_speichern(jsonb, text) to authenticated;

commit;
