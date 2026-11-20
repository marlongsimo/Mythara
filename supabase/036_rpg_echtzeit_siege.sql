-- =====================================================================
-- MYTHARA · RPG · Migration 036: Gewonnene Kämpfe der Splitterlande, vom Spielserver eingetragen
-- =====================================================================
-- Voraussetzung: Migrationen 002 (Profile), 034 (Spielstand) und 035 (EP und Seelensplitter) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_siege: je Spielerkonto, welche Kampagnenkämpfe gewonnen wurden (Ort, Kampf, erster Sieg).
--      Nur der Spielserver trägt ein; für Spieler ist sie weder les- noch schreibbar.
--      Daraus ergibt sich, welche Kampagnen geschafft und welche freigeschaltet sind – der Browser kann das nicht mehr vorgeben.
--   2) rpg_echtzeit_siege(): gibt dem angemeldeten Spieler seine eigenen Siege zurück ([{ort, kampf}]).
--   3) rpg_echtzeit_sieg(Spieler, Ort, Kampf): trägt einen Sieg ein (ein zweiter Sieg im selben Kampf ändert nichts). NUR für den Spielserver.
--   4) Einmalige Übernahme aus dem bisherigen Spielstand (Migration 034): Weidenhain geschafft → alle drei Kämpfe; angefangene Runde → die dort schon gewonnenen Kämpfe.
--
-- NUR FÜR DAS RPG. Rückbau: 036_rpg_echtzeit_siege_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
  if to_regclass('public.rpg_echtzeit_stand') is null then raise exception 'Migration 034 (Spielstand der Splitterlande) fehlt.'; end if;
  if to_regclass('public.rpg_echtzeit_werte') is null then raise exception 'Migration 035 (EP und Seelensplitter) fehlt.'; end if;
end $$;

create table if not exists public.rpg_echtzeit_siege (
  user_id     uuid         not null references auth.users(id) on delete cascade,
  ort         text         not null check (ort ~ '^[a-z]{2,20}$'),
  kampf       text         not null check (kampf ~ '^[a-z]{2,20}$'),
  created_at  timestamptz  not null default now(),
  primary key (user_id, ort, kampf)
);
alter table public.rpg_echtzeit_siege enable row level security;
revoke all on public.rpg_echtzeit_siege from anon, authenticated;

create or replace function public.rpg_echtzeit_siege()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Der Fortschritt gehört zu einem Spielerkonto. Bitte melde dich an.'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('ort', ort, 'kampf', kampf) order by created_at) from public.rpg_echtzeit_siege where user_id = v_uid), '[]'::jsonb);
end;
$$;

create or replace function public.rpg_echtzeit_sieg(p_user uuid, p_ort text, p_kampf text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_user is null or not public.rpg_ist_konto(p_user) then raise exception 'Kein Spielerkonto.'; end if;
  if coalesce(p_ort, '') !~ '^[a-z]{2,20}$' or coalesce(p_kampf, '') !~ '^[a-z]{2,20}$' then raise exception 'Ort oder Kampf ungültig.'; end if;
  insert into public.rpg_echtzeit_siege (user_id, ort, kampf) values (p_user, p_ort, p_kampf) on conflict do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.rpg_echtzeit_siege() from public, anon;
grant execute on function public.rpg_echtzeit_siege() to authenticated;
revoke all on function public.rpg_echtzeit_sieg(uuid, text, text) from public, anon, authenticated;
grant execute on function public.rpg_echtzeit_sieg(uuid, text, text) to service_role;
grant select on public.rpg_echtzeit_siege to service_role;

-- Einmalige Übernahme: Weidenhain war im bisherigen Spielstand geschafft (ez_kampagnen ≥ 1)
insert into public.rpg_echtzeit_siege (user_id, ort, kampf)
select s.user_id, 'weidenhain', k from public.rpg_echtzeit_stand s, unnest(array['speicher', 'muehle', 'wehr']) k
where (s.stand -> 'daten' ->> 'ez_kampagnen') ~ '^[0-9]+$' and (s.stand -> 'daten' ->> 'ez_kampagnen')::integer >= 1 and public.rpg_ist_konto(s.user_id)
on conflict do nothing;
-- … und einzelne gewonnene Kämpfe aus einer angefangenen Weidenhain-Runde (Merker kampf_speicher, kampf_muehle, kampf_wehr)
do $$ declare r record; v_m jsonb; k text; begin
  for r in select s.user_id, s.stand from public.rpg_echtzeit_stand s where public.rpg_ist_konto(s.user_id) loop
    begin v_m := (r.stand -> 'daten' ->> 'ez_ort_weidenhain')::jsonb; exception when others then v_m := null; end;
    if v_m is null or jsonb_typeof(v_m) <> 'object' then continue; end if;
    foreach k in array array['speicher', 'muehle', 'wehr'] loop
      if (v_m ->> ('kampf_' || k)) = 'true' then insert into public.rpg_echtzeit_siege (user_id, ort, kampf) values (r.user_id, 'weidenhain', k) on conflict do nothing; end if;
    end loop;
  end loop;
end $$;

commit;
