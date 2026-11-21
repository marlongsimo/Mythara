-- =====================================================================
-- MYTHARA · RPG · Migration 039: Splitterlande – die gemerkte Stelle in der offenen Welt (MMO)
-- =====================================================================
-- Voraussetzung: Migration 002 (Profile) ist eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_position: Wo ein Spieler zuletzt in der Welt stand (Region und Weltfelder). Kein direkter Zugriff
--      für Spieler; nur der Spielserver liest und schreibt (service_role).
--   2) rpg_echtzeit_position_setzen(Spieler, Region, x, y): NUR für den Spielserver. x/y null = am Start der Region
--      (nach einem Tod oder Teleport). Browser können ihre Stelle nicht selbst setzen.
-- Beim nächsten Anmelden – auch auf einem anderen Gerät – beginnt der Spieler wieder an dieser Stelle.
--
-- NUR FÜR DAS RPG. Rückbau: 039_rpg_echtzeit_position_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
end $$;

create table if not exists public.rpg_echtzeit_position (
  user_id     uuid              primary key references auth.users(id) on delete cascade,
  region      text              not null check (region ~ '^[a-z_]{2,30}$'),
  x           double precision  check (x is null or (x >= 0 and x <= 100000)),
  y           double precision  check (y is null or (y >= 0 and y <= 100000)),
  updated_at  timestamptz       not null default now()
);
alter table public.rpg_echtzeit_position enable row level security;
revoke all on public.rpg_echtzeit_position from anon, authenticated;
grant select on public.rpg_echtzeit_position to service_role;  -- der Spielserver liest die Stelle beim Anmelden (REST mit Server-Schlüssel)

create or replace function public.rpg_echtzeit_position_setzen(p_user uuid, p_region text, p_x double precision, p_y double precision)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_user is null or not public.rpg_ist_konto(p_user) then raise exception 'Kein Spielerkonto.'; end if;
  if coalesce(p_region, '') !~ '^[a-z_]{2,30}$' then raise exception 'Region ungültig.'; end if;
  if (p_x is null) <> (p_y is null) then raise exception 'Stelle ungültig.'; end if;
  if p_x is not null and (p_x < 0 or p_x > 100000 or p_y < 0 or p_y > 100000 or p_x = 'NaN'::float8 or p_y = 'NaN'::float8) then raise exception 'Stelle ungültig.'; end if;
  insert into public.rpg_echtzeit_position (user_id, region, x, y) values (p_user, p_region, p_x, p_y)
    on conflict (user_id) do update set region = excluded.region, x = excluded.x, y = excluded.y, updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.rpg_echtzeit_position_setzen(uuid, text, double precision, double precision) from public, anon, authenticated;
grant execute on function public.rpg_echtzeit_position_setzen(uuid, text, double precision, double precision) to service_role;

commit;
