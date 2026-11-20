-- =====================================================================
-- MYTHARA · RPG · Migration 038: Splitterlande – ein aktiver Held je Spieler (MMO)
-- =====================================================================
-- Voraussetzung: Migration 002 (Profile) ist eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_aktiver_held: Mit welchem Helden ein Spieler unterwegs ist. Kein direkter Zugriff.
--   2) rpg_echtzeit_mein_held(): Spieler liest seinen aktiven Helden (oder null, wenn noch keiner gewählt ist).
--   3) rpg_echtzeit_held_setzen(Spieler, Held): NUR für den Spielserver (service_role). Der Server erlaubt den Wechsel
--      nur, solange der Spieler in der Waldmark (der Basis) ist – Browser können den Helden nicht selbst ändern.
-- Erfahrung je Held bleibt in rpg_echtzeit_werte (Migration 035); gelevelt wird nur, wer gespielt wird.
--
-- NUR FÜR DAS RPG. Rückbau: 038_rpg_echtzeit_aktiver_held_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
end $$;

create table if not exists public.rpg_echtzeit_aktiver_held (
  user_id     uuid         primary key references auth.users(id) on delete cascade,
  held        text         not null check (held ~ '^[a-z]{3,20}$'),
  updated_at  timestamptz  not null default now()
);
alter table public.rpg_echtzeit_aktiver_held enable row level security;
revoke all on public.rpg_echtzeit_aktiver_held from anon, authenticated;

create or replace function public.rpg_echtzeit_mein_held()
returns text language sql stable security definer set search_path = public as $$
  select held from public.rpg_echtzeit_aktiver_held where user_id = auth.uid();
$$;
revoke all on function public.rpg_echtzeit_mein_held() from public, anon;
grant execute on function public.rpg_echtzeit_mein_held() to authenticated;

create or replace function public.rpg_echtzeit_held_setzen(p_user uuid, p_held text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_user is null or not public.rpg_ist_konto(p_user) then raise exception 'Kein Spielerkonto.'; end if;
  if coalesce(p_held, '') !~ '^[a-z]{3,20}$' then raise exception 'Held ungültig.'; end if;
  insert into public.rpg_echtzeit_aktiver_held (user_id, held) values (p_user, p_held)
    on conflict (user_id) do update set held = excluded.held, updated_at = now();
  return jsonb_build_object('ok', true, 'held', p_held);
end;
$$;
revoke all on function public.rpg_echtzeit_held_setzen(uuid, text) from public, anon, authenticated;
grant execute on function public.rpg_echtzeit_held_setzen(uuid, text) to service_role;

commit;
