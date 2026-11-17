-- =====================================================================
-- MYTHARA · RPG · Migration 028: Freunde werben – je ein Heldentoken für Werber und Freund
-- =====================================================================
-- Voraussetzung: Migrationen 002 (Profile), 006 (Heldensammlung) und 026 (Heldentoken) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_referrals: wer von wem geworben wurde (je Konto höchstens ein Werber) und ob die Belohnung schon vergeben ist.
--   2) rpg_referral_set(Name): Ein NEUES Konto trägt ein, wer es geworben hat. Gilt nur, wenn
--        – das Konto ein Spielerkonto ist (kein Gast), höchstens 14 Tage alt ist,
--        – noch kein Kampagnen-Ende gemeldet hat, noch keinen Werber hat und sich nicht selbst einträgt.
--      Die Funktion wirft keine Fehler, sie meldet { ok, grund } zurück.
--   3) Belohnung: Meldet ein geworbenes Konto sein ERSTES Kampagnen-Ende (rpg_ending_claims), bekommen BEIDE je einen
--      Heldentoken: der Freund und sein Werber. Der Werber wird für höchstens rpg_referral_max() = 5 Freunde belohnt;
--      der Freund bekommt seinen Token auch dann, wenn sein Werber diese Grenze schon erreicht hat.
--      rpg_claim_ending selbst bleibt unverändert; die Belohnung hängt als Trigger an der Tabelle der gemeldeten Enden.
--   4) rpg_referral_status(): eigener Name (für den Einladungslink), geworbene Freunde mit Stand, Zahl der Belohnungen.
--
-- NUR FÜR DAS RPG. Rückbau: 028_rpg_freunde_werben_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_profiles') is null or to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
  if to_regclass('public.rpg_ending_claims') is null then raise exception 'Migration 006 (Heldensammlung) fehlt.'; end if;
  if to_regclass('public.rpg_hero_tokens') is null then raise exception 'Migration 026 (Heldentoken) fehlt.'; end if;
end $$;

-- ---------------------------------------------------------------------
-- 1) Tabelle
-- ---------------------------------------------------------------------
create table if not exists public.rpg_referrals (
  invitee      uuid         primary key references auth.users(id) on delete cascade,   -- das geworbene Konto
  referrer     uuid         not null references auth.users(id) on delete cascade,      -- wer geworben hat
  created_at   timestamptz  not null default now(),
  rewarded_at  timestamptz,                                                             -- gesetzt, sobald der Werber seinen Token bekommen hat
  invitee_rewarded_at timestamptz,                                                      -- gesetzt, sobald der Freund seinen Token bekommen hat
  check (invitee <> referrer)
);
create index if not exists rpg_referrals_referrer on public.rpg_referrals (referrer, created_at desc);
alter table public.rpg_referrals add column if not exists invitee_rewarded_at timestamptz;
alter table public.rpg_referrals enable row level security;
revoke all on public.rpg_referrals from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2) Stellschrauben
-- ---------------------------------------------------------------------
create or replace function public.rpg_referral_max() returns integer language sql immutable as $$ select 5; $$;                        -- belohnte Freunde je Konto
create or replace function public.rpg_referral_frist() returns interval language sql immutable as $$ select interval '14 days'; $$;    -- so lange gilt ein Konto als neu

-- ---------------------------------------------------------------------
-- 3) Eintragen, wer geworben hat
-- ---------------------------------------------------------------------
create or replace function public.rpg_referral_set(p_von text)
returns jsonb language plpgsql volatile security definer set search_path = public, auth as $$
declare v_uid uuid := auth.uid(); v_ref uuid; v_name text; v_alt timestamptz;
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then return jsonb_build_object('ok', false, 'grund', 'konto'); end if;
  if exists (select 1 from public.rpg_referrals where invitee = v_uid) then return jsonb_build_object('ok', false, 'grund', 'schon'); end if;
  select user_id, handle into v_ref, v_name from public.rpg_profiles where lower(handle) = lower(btrim(coalesce(p_von, '')));
  if v_ref is null or not public.rpg_ist_konto(v_ref) then return jsonb_build_object('ok', false, 'grund', 'unbekannt'); end if;
  if v_ref = v_uid then return jsonb_build_object('ok', false, 'grund', 'selbst'); end if;
  select created_at into v_alt from auth.users where id = v_uid;
  if v_alt is null or v_alt < now() - public.rpg_referral_frist() then return jsonb_build_object('ok', false, 'grund', 'alt'); end if;
  if exists (select 1 from public.rpg_ending_claims where user_id = v_uid) then return jsonb_build_object('ok', false, 'grund', 'gespielt'); end if;
  insert into public.rpg_referrals (invitee, referrer) values (v_uid, v_ref) on conflict (invitee) do nothing;
  return jsonb_build_object('ok', true, 'von', v_name);
end;
$$;

-- ---------------------------------------------------------------------
-- 4) Belohnung beim ersten gemeldeten Kampagnen-Ende des geworbenen Kontos
-- ---------------------------------------------------------------------
create or replace function public.rpg_referral_belohnen()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_r public.rpg_referrals%rowtype;
begin
  select * into v_r from public.rpg_referrals where invitee = new.user_id for update;
  if not found then return new; end if;
  -- Der Freund: ein Token beim ersten gemeldeten Ende
  if v_r.invitee_rewarded_at is null then
    insert into public.rpg_hero_tokens (user_id, anzahl) values (new.user_id, 1)
      on conflict (user_id) do update set anzahl = public.rpg_hero_tokens.anzahl + 1, updated_at = now();
    update public.rpg_referrals set invitee_rewarded_at = now() where invitee = new.user_id;
  end if;
  -- Der Werber: ein Token, solange er die Obergrenze nicht erreicht hat
  if v_r.rewarded_at is null then
    perform pg_advisory_xact_lock(hashtext('rpg_referral:' || v_r.referrer::text));
    if (select count(*) from public.rpg_referrals where referrer = v_r.referrer and rewarded_at is not null) < public.rpg_referral_max() then
      insert into public.rpg_hero_tokens (user_id, anzahl) values (v_r.referrer, 1)
        on conflict (user_id) do update set anzahl = public.rpg_hero_tokens.anzahl + 1, updated_at = now();
      update public.rpg_referrals set rewarded_at = now() where invitee = new.user_id;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists rpg_referral_bei_ende on public.rpg_ending_claims;
create trigger rpg_referral_bei_ende after insert on public.rpg_ending_claims
  for each row execute function public.rpg_referral_belohnen();

-- ---------------------------------------------------------------------
-- 5) Stand für die Anzeige
-- ---------------------------------------------------------------------
create or replace function public.rpg_referral_status()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then return jsonb_build_object('konto', false); end if;
  return jsonb_build_object('konto', true,
    'name', (select handle from public.rpg_profiles where user_id = v_uid),
    'max', public.rpg_referral_max(),
    'belohnt', (select count(*) from public.rpg_referrals where referrer = v_uid and rewarded_at is not null),
    'offen', (select count(*) from public.rpg_referrals where referrer = v_uid and rewarded_at is null),
    'von', (select p.handle from public.rpg_referrals r join public.rpg_profiles p on p.user_id = r.referrer where r.invitee = v_uid),
    'selbst_belohnt', coalesce((select invitee_rewarded_at is not null from public.rpg_referrals where invitee = v_uid), false),
    'freunde', coalesce((select jsonb_agg(jsonb_build_object('name', p.handle, 'belohnt', r.rewarded_at is not null, 'seit', r.created_at) order by r.created_at desc)
      from public.rpg_referrals r join public.rpg_profiles p on p.user_id = r.invitee where r.referrer = v_uid), '[]'::jsonb));
end;
$$;

revoke all on function public.rpg_referral_max(), public.rpg_referral_frist(), public.rpg_referral_set(text), public.rpg_referral_belohnen(), public.rpg_referral_status() from public, anon;
grant execute on function public.rpg_referral_set(text), public.rpg_referral_status() to authenticated;

commit;
