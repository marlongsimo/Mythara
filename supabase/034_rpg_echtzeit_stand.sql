-- =====================================================================
-- MYTHARA · RPG · Migration 034: Spielstand der Splitterlande (Echtzeit)
-- =====================================================================
-- Voraussetzung: Migration 002 (Profile) ist eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_stand: je Spielerkonto eine Zeile mit dem Spielstand der Splitterlande (Team, geschaffte Kampagnen,
--      Fortschritt in Orten) als JSON, dazu eine Versionsnummer und der Zeitpunkt der letzten Änderung.
--   2) rpg_echtzeit_laden(): gibt den eigenen Stand zurück ({stand, version}); ohne gespeicherten Stand: leerer Stand, Version 0.
--   3) rpg_echtzeit_speichern(Stand, bekannte Version): speichert den eigenen Stand. Stimmt die bekannte Version nicht mehr
--      (ein anderes Gerät hat inzwischen gespeichert), wird nichts überschrieben und der neuere Stand zurückgegeben.
--      Nur mit Spielerkonto; der Stand darf höchstens 60 000 Bytes groß sein.
--   Niemand kann fremde Stände lesen oder ändern: Die Tabelle ist nicht direkt zugänglich, beide Funktionen arbeiten nur mit auth.uid().
--
-- NUR FÜR DAS RPG. Rückbau: 034_rpg_echtzeit_stand_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_profiles') is null or to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
end $$;

create table if not exists public.rpg_echtzeit_stand (
  user_id     uuid         primary key references auth.users(id) on delete cascade,
  stand       jsonb        not null default '{}'::jsonb,
  version     integer      not null default 1,
  updated_at  timestamptz  not null default now()
);
alter table public.rpg_echtzeit_stand enable row level security;
revoke all on public.rpg_echtzeit_stand from anon, authenticated;

create or replace function public.rpg_echtzeit_laden()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_z public.rpg_echtzeit_stand;
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Der Spielstand gehört zu einem Spielerkonto. Bitte melde dich an.'; end if;
  select * into v_z from public.rpg_echtzeit_stand where user_id = v_uid;
  if not found then return jsonb_build_object('stand', '{}'::jsonb, 'version', 0); end if;
  return jsonb_build_object('stand', v_z.stand, 'version', v_z.version, 'geaendert', v_z.updated_at);
end;
$$;

create or replace function public.rpg_echtzeit_speichern(p_stand jsonb, p_version integer default 0)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_z public.rpg_echtzeit_stand;
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Der Spielstand gehört zu einem Spielerkonto. Bitte melde dich an.'; end if;
  if p_stand is null or jsonb_typeof(p_stand) <> 'object' then raise exception 'Der Spielstand ist ungültig.'; end if;
  if pg_column_size(p_stand) > 60000 then raise exception 'Der Spielstand ist zu groß.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_echtzeit_stand:' || v_uid::text));
  select * into v_z from public.rpg_echtzeit_stand where user_id = v_uid;
  if not found then
    insert into public.rpg_echtzeit_stand (user_id, stand, version) values (v_uid, p_stand, 1);
    return jsonb_build_object('ok', true, 'version', 1);
  end if;
  if coalesce(p_version, 0) <> v_z.version then
    return jsonb_build_object('ok', false, 'konflikt', true, 'stand', v_z.stand, 'version', v_z.version);
  end if;
  update public.rpg_echtzeit_stand set stand = p_stand, version = v_z.version + 1, updated_at = now() where user_id = v_uid;
  return jsonb_build_object('ok', true, 'version', v_z.version + 1);
end;
$$;

revoke all on function public.rpg_echtzeit_laden() from public, anon;
revoke all on function public.rpg_echtzeit_speichern(jsonb, integer) from public, anon;
grant execute on function public.rpg_echtzeit_laden() to authenticated;
grant execute on function public.rpg_echtzeit_speichern(jsonb, integer) to authenticated;

commit;
