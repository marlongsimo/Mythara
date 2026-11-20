-- =====================================================================
-- MYTHARA · RPG · Migration 037: Koop-Einladungen der Splitterlande (nur an Freunde)
-- =====================================================================
-- Voraussetzung: Migrationen 002 (Profile) und 003 (Freunde) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_einladungen: Wer wen in seine Koop-Gruppe eingeladen hat (mit dem Gruppencode des Spielservers).
--      Kein direkter Zugriff; alles läuft über die Funktionen unten. Einladungen gelten 30 Minuten.
--   2) rpg_echtzeit_einladen(Name, Code): lädt einen bestätigten Freund ein. Eine neue Einladung ersetzt die alte an dieselbe Person.
--   3) rpg_echtzeit_einladungen(): meine offenen Einladungen ([{id, von, code, seit}]).
--   4) rpg_echtzeit_einladung_weg(id): eine Einladung an mich entfernen (angenommen oder abgelehnt).
-- Die Freundesliste selbst ist die des Würfelspiels (Migration 003): dasselbe Konto, dieselben Freunde.
--
-- NUR FÜR DAS RPG. Rückbau: 037_rpg_echtzeit_einladungen_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
  if to_regprocedure('public.rpg_sind_freunde(uuid, uuid)') is null or to_regprocedure('public.rpg_uid_von(text)') is null then raise exception 'Migration 003 (Freunde) fehlt.'; end if;
end $$;

create table if not exists public.rpg_echtzeit_einladungen (
  id          uuid         primary key default gen_random_uuid(),
  from_user   uuid         not null references auth.users(id) on delete cascade,
  to_user     uuid         not null references auth.users(id) on delete cascade,
  code        text         not null check (code ~ '^[A-Z]{6}$'),
  created_at  timestamptz  not null default now(),
  check (from_user <> to_user)
);
create unique index if not exists rpg_echtzeit_einladungen_paar on public.rpg_echtzeit_einladungen (from_user, to_user);
create index if not exists rpg_echtzeit_einladungen_an on public.rpg_echtzeit_einladungen (to_user, created_at desc);
alter table public.rpg_echtzeit_einladungen enable row level security;
revoke all on public.rpg_echtzeit_einladungen from anon, authenticated;

create or replace function public.rpg_echtzeit_einladen(p_handle text, p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_an uuid;
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Einladen geht nur mit einem Spielerkonto.'; end if;
  if coalesce(p_code, '') !~ '^[A-Z]{6}$' then raise exception 'Gruppencode ungültig.'; end if;
  v_an := public.rpg_uid_von(coalesce(p_handle, ''));
  if v_an is null or v_an = v_uid or not public.rpg_sind_freunde(v_uid, v_an) then raise exception 'Du kannst nur Freunde einladen.'; end if;
  delete from public.rpg_echtzeit_einladungen where created_at < now() - interval '1 day'; -- alte aufräumen
  insert into public.rpg_echtzeit_einladungen (from_user, to_user, code) values (v_uid, v_an, p_code)
    on conflict (from_user, to_user) do update set code = excluded.code, created_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rpg_echtzeit_einladungen()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'von', p.handle, 'code', e.code, 'seit', e.created_at) order by e.created_at desc)
    from public.rpg_echtzeit_einladungen e join public.rpg_profiles p on p.user_id = e.from_user
    where e.to_user = auth.uid() and e.created_at > now() - interval '30 minutes' and public.rpg_sind_freunde(e.from_user, e.to_user)), '[]'::jsonb);
$$;

create or replace function public.rpg_echtzeit_einladung_weg(p_id uuid)
returns jsonb language sql security definer set search_path = public as $$
  delete from public.rpg_echtzeit_einladungen where id = p_id and to_user = auth.uid();
  select jsonb_build_object('ok', true);
$$;

revoke all on function public.rpg_echtzeit_einladen(text, text), public.rpg_echtzeit_einladungen(), public.rpg_echtzeit_einladung_weg(uuid) from public, anon;
grant execute on function public.rpg_echtzeit_einladen(text, text), public.rpg_echtzeit_einladungen(), public.rpg_echtzeit_einladung_weg(uuid) to authenticated;

commit;
