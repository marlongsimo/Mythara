-- =====================================================================
-- MYTHARA · RPG · Migration 035: Erfahrung und Seelensplitter der Splitterlande, vom Spielserver gutgeschrieben
-- =====================================================================
-- Voraussetzung: Migrationen 002 (Profile) und 034 (Spielstand der Splitterlande) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_echtzeit_werte: je Spielerkonto die Erfahrung je Held (JSON, z. B. {"schildwaechter": 142}) und die Zahl der Seelensplitter.
--      Niemand außer dem Spielserver kann sie ändern: Sie ist für Spieler weder les- noch schreibbar.
--   2) Tabelle rpg_echtzeit_kaempfe: ein Protokoll jeder Gutschrift (wer, welcher Kampf, wie viel, wann) zum Nachprüfen.
--   3) rpg_echtzeit_werte(): gibt dem angemeldeten Spieler seine eigenen Werte zurück ({ep, seelen}).
--   4) rpg_echtzeit_gutschrift(Spieler, EP je Held, Seelensplitter, Kampf): schreibt gut und gibt die neuen Werte zurück.
--      NUR für den Spielserver (Rolle service_role). Der Server rechnet die Kämpfe selbst und kennt deshalb die echten Zahlen.
--      Obergrenzen je Aufruf: höchstens 3 Helden, je Held 0 bis 5000 EP, 0 bis 5000 Seelensplitter.
--   5) Einmalige Übernahme: Wer bereits einen Spielstand (Migration 034) hat, bekommt die dort gespeicherten EP und Seelensplitter als Startwerte.
--
-- NUR FÜR DAS RPG. Rückbau: 035_rpg_echtzeit_werte_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich (die Übernahme geschieht nur einmal je Konto).
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_profiles') is null or to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
  if to_regclass('public.rpg_echtzeit_stand') is null then raise exception 'Migration 034 (Spielstand der Splitterlande) fehlt.'; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then raise exception 'Die Rolle service_role fehlt (gibt es in jedem Supabase-Projekt).'; end if;
end $$;

create table if not exists public.rpg_echtzeit_werte (
  user_id     uuid         primary key references auth.users(id) on delete cascade,
  ep          jsonb        not null default '{}'::jsonb,
  seelen      integer      not null default 0 check (seelen >= 0),
  updated_at  timestamptz  not null default now()
);
alter table public.rpg_echtzeit_werte enable row level security;
revoke all on public.rpg_echtzeit_werte from anon, authenticated;

create table if not exists public.rpg_echtzeit_kaempfe (
  id          bigserial    primary key,
  user_id     uuid         not null references auth.users(id) on delete cascade,
  kampf       text         not null,
  ep          jsonb        not null default '{}'::jsonb,
  seelen      integer      not null default 0,
  created_at  timestamptz  not null default now()
);
create index if not exists rpg_echtzeit_kaempfe_user on public.rpg_echtzeit_kaempfe (user_id, created_at desc);
alter table public.rpg_echtzeit_kaempfe enable row level security;
revoke all on public.rpg_echtzeit_kaempfe from anon, authenticated;

create or replace function public.rpg_echtzeit_werte()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_w public.rpg_echtzeit_werte;
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Die Werte gehören zu einem Spielerkonto. Bitte melde dich an.'; end if;
  select * into v_w from public.rpg_echtzeit_werte where user_id = v_uid;
  if not found then return jsonb_build_object('ep', '{}'::jsonb, 'seelen', 0); end if;
  return jsonb_build_object('ep', v_w.ep, 'seelen', v_w.seelen);
end;
$$;

create or replace function public.rpg_echtzeit_gutschrift(p_user uuid, p_ep jsonb, p_seelen integer, p_kampf text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_w public.rpg_echtzeit_werte; v_k text; v_n integer; v_ep jsonb := coalesce(p_ep, '{}'::jsonb); v_s integer := coalesce(p_seelen, 0);
begin
  if p_user is null or not public.rpg_ist_konto(p_user) then raise exception 'Kein Spielerkonto.'; end if;
  if jsonb_typeof(v_ep) <> 'object' then raise exception 'EP ungültig.'; end if;
  if (select count(*) from jsonb_object_keys(v_ep)) > 3 then raise exception 'Höchstens drei Helden je Kampf.'; end if;
  if v_s < 0 or v_s > 5000 then raise exception 'Seelensplitter außerhalb der Grenzen.'; end if;
  for v_k in select jsonb_object_keys(v_ep) loop
    if v_k !~ '^[a-z]{3,20}$' or jsonb_typeof(v_ep -> v_k) <> 'number' then raise exception 'EP ungültig.'; end if;
    v_n := (v_ep ->> v_k)::numeric::integer; if v_n < 0 or v_n > 5000 then raise exception 'EP außerhalb der Grenzen.'; end if;
  end loop;
  perform pg_advisory_xact_lock(hashtext('rpg_echtzeit_werte:' || p_user::text));
  insert into public.rpg_echtzeit_werte (user_id) values (p_user) on conflict (user_id) do nothing;
  select * into v_w from public.rpg_echtzeit_werte where user_id = p_user for update;
  for v_k in select jsonb_object_keys(v_ep) loop
    v_w.ep := jsonb_set(v_w.ep, array[v_k], to_jsonb(coalesce((v_w.ep ->> v_k)::numeric::integer, 0) + (v_ep ->> v_k)::numeric::integer));
  end loop;
  update public.rpg_echtzeit_werte set ep = v_w.ep, seelen = v_w.seelen + v_s, updated_at = now() where user_id = p_user;
  insert into public.rpg_echtzeit_kaempfe (user_id, kampf, ep, seelen) values (p_user, left(coalesce(p_kampf, '?'), 40), v_ep, v_s);
  return jsonb_build_object('ep', v_w.ep, 'seelen', v_w.seelen + v_s);
end;
$$;

revoke all on function public.rpg_echtzeit_werte() from public, anon;
grant execute on function public.rpg_echtzeit_werte() to authenticated;
revoke all on function public.rpg_echtzeit_gutschrift(uuid, jsonb, integer, text) from public, anon, authenticated;
grant execute on function public.rpg_echtzeit_gutschrift(uuid, jsonb, integer, text) to service_role;
grant select on public.rpg_echtzeit_werte, public.rpg_echtzeit_kaempfe to service_role;

-- Einmalige Übernahme aus dem bisherigen Spielstand (Migration 034): EP und Seelensplitter, die bisher im Browser gezählt wurden
do $$ declare r record; v_ep jsonb; v_s integer; begin
  for r in select s.user_id, s.stand from public.rpg_echtzeit_stand s where not exists (select 1 from public.rpg_echtzeit_werte w where w.user_id = s.user_id) loop
    begin v_ep := (r.stand -> 'daten' ->> 'ez_ep')::jsonb; exception when others then v_ep := null; end;
    if v_ep is null or jsonb_typeof(v_ep) <> 'object' then v_ep := '{}'::jsonb; end if;
    begin v_s := greatest(0, least(100000, coalesce((r.stand -> 'daten' ->> 'ez_seelen')::numeric::integer, 0))); exception when others then v_s := 0; end;
    insert into public.rpg_echtzeit_werte (user_id, ep, seelen) values (r.user_id, v_ep, v_s) on conflict (user_id) do nothing;
  end loop;
end $$;

commit;
