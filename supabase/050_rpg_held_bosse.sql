-- =====================================================================
-- MYTHARA · RPG · Migration 050: Riftmere – Bosszähler und Bestzeit je Konto (Phase 4, Issue #48)
-- =====================================================================
-- Voraussetzung: Migration 040 (rpg_held) ist eingespielt.
--
-- Was diese Migration tut (nur Ergänzungen, nichts wird gelöscht oder geändert):
--   1) Tabelle rpg_held_bosse: je Konto und Boss die Zahl der Siege, die Bestzeit (Sekunden, eine Nachkommastelle), erster und letzter Sieg.
--      Jeder Spieler darf seine eigenen Zeilen lesen (Anzeige im Spiel), schreiben darf nur der Spielserver.
--   2) rpg_held_boss_sieg(Spieler, Boss, Sekunden): NUR der Spielserver (service_role). Zählt einen Sieg und merkt die Bestzeit.
--      Rückgabe {"siege": n, "bestzeit": s}. Grenzen: Boss-ID aus a–z, 0–9, _ (höchstens 40 Zeichen); 0 bis 86400 Sekunden
--      (0 = unbekannt, zählt nicht als Bestzeit).
--   3) rpg_held_bosse_lesen(): der angemeldete Spieler liest seine Zähler {"boss": {"siege": n, "bestzeit": s}, …}.
--
-- NUR FÜR DAS RPG. Rückbau: 050_rpg_held_bosse_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_held') is null then raise exception 'Migration 040 (rpg_held) fehlt.'; end if;
end $$;

create table if not exists public.rpg_held_bosse (
  user_id uuid not null references auth.users (id) on delete cascade,
  boss text not null check (boss ~ '^[a-z0-9_]{1,40}$'),
  siege integer not null default 0 check (siege >= 0),
  bestzeit numeric(7, 1) check (bestzeit is null or (bestzeit > 0 and bestzeit <= 86400)),
  erster_sieg timestamptz not null default now(),
  letzter_sieg timestamptz not null default now(),
  primary key (user_id, boss)
);
alter table public.rpg_held_bosse enable row level security;
drop policy if exists rpg_held_bosse_lesen on public.rpg_held_bosse;
create policy rpg_held_bosse_lesen on public.rpg_held_bosse for select to authenticated using (user_id = auth.uid());
revoke all on public.rpg_held_bosse from public, anon, authenticated;
grant select on public.rpg_held_bosse to authenticated;
grant select, insert, update on public.rpg_held_bosse to service_role;

create or replace function public.rpg_held_boss_sieg(p_user uuid, p_boss text, p_sekunden numeric)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare s numeric := round(coalesce(p_sekunden, 0), 1); r public.rpg_held_bosse;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_boss is null or p_boss !~ '^[a-z0-9_]{1,40}$' then raise exception 'Unbekannte Boss-ID.'; end if;
  if s < 0 or s > 86400 then raise exception 'Unzulässige Kampfdauer.'; end if;
  insert into public.rpg_held_bosse as b (user_id, boss, siege, bestzeit) values (p_user, p_boss, 1, nullif(s, 0))
    on conflict (user_id, boss) do update set siege = b.siege + 1, letzter_sieg = now(),
      bestzeit = case when s > 0 and (b.bestzeit is null or s < b.bestzeit) then s else b.bestzeit end
    returning * into r;
  return jsonb_build_object('siege', r.siege, 'bestzeit', r.bestzeit);
end;
$$;
revoke all on function public.rpg_held_boss_sieg(uuid, text, numeric) from public, anon, authenticated;
grant execute on function public.rpg_held_boss_sieg(uuid, text, numeric) to service_role;

create or replace function public.rpg_held_bosse_lesen()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(boss, jsonb_build_object('siege', siege, 'bestzeit', bestzeit)), '{}'::jsonb) from public.rpg_held_bosse where user_id = auth.uid();
$$;
revoke all on function public.rpg_held_bosse_lesen() from public, anon;
grant execute on function public.rpg_held_bosse_lesen() to authenticated;

commit;
