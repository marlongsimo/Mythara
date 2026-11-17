-- =====================================================================
-- MYTHARA · RPG · Migration 032: Feedback und Fehlermeldungen aus dem Spiel
-- =====================================================================
-- Voraussetzung: Migrationen 002 (Profile) und 006 (Heldensammlung, Admins) sind eingespielt.
--
-- Was diese Migration tut (alles neu, nichts Bestehendes wird geändert oder gelöscht):
--   1) Tabelle rpg_feedback: Nachricht, Art ('feedback' oder 'bug'), Absender, technische Angaben (Spielstand, Gerät), gelesen.
--   2) rpg_feedback_send(Art, Text, Angaben): nur mit Spielerkonto. Text 5 bis 2000 Zeichen.
--      Begrenzung je Konto: höchstens 5 Nachrichten je Stunde und 20 je Tag.
--   3) rpg_admin_feedback(nur ungelesene?): Liste für den Admin-Bereich (neueste zuerst, höchstens 200) mit Zahl der ungelesenen.
--      rpg_admin_feedback_read(Nachricht, gelesen?): als gelesen oder ungelesen markieren. Beides nur für Admins.
--
-- NUR FÜR DAS RPG. Rückbau: 032_rpg_feedback_rueckbau.sql
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;

do $$ begin
  if to_regclass('public.rpg_profiles') is null or to_regprocedure('public.rpg_ist_konto(uuid)') is null then raise exception 'Migration 002 (Profile) fehlt.'; end if;
  if to_regprocedure('public.rpg_ist_admin()') is null then raise exception 'Migration 006 (Heldensammlung, Admins) fehlt.'; end if;
end $$;

create table if not exists public.rpg_feedback (
  id          uuid         primary key default gen_random_uuid(),
  user_id     uuid         references auth.users(id) on delete set null,
  handle      text,
  art         text         not null check (art in ('feedback', 'bug')),
  text        text         not null check (char_length(text) between 5 and 2000),
  kontext     jsonb        not null default '{}'::jsonb,
  created_at  timestamptz  not null default now(),
  gelesen_at  timestamptz
);
create index if not exists rpg_feedback_neu on public.rpg_feedback (created_at desc);
create index if not exists rpg_feedback_user on public.rpg_feedback (user_id, created_at desc);
alter table public.rpg_feedback enable row level security;
revoke all on public.rpg_feedback from anon, authenticated;

create or replace function public.rpg_feedback_send(p_art text, p_text text, p_kontext jsonb default '{}'::jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_text text := btrim(coalesce(p_text, '')); v_k jsonb := coalesce(p_kontext, '{}'::jsonb);
begin
  if v_uid is null or not public.rpg_ist_konto(v_uid) then raise exception 'Feedback kannst du mit einem Spielerkonto senden.'; end if;
  if p_art is null or p_art not in ('feedback', 'bug') then raise exception 'Bitte wähle Feedback oder Bug.'; end if;
  if char_length(v_text) < 5 then raise exception 'Bitte schreib ein paar Worte dazu.'; end if;
  if char_length(v_text) > 2000 then raise exception 'Die Nachricht ist zu lang (höchstens 2000 Zeichen).'; end if;
  if jsonb_typeof(v_k) <> 'object' or pg_column_size(v_k) > 4000 then v_k := '{}'::jsonb; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_feedback:' || v_uid::text));
  if (select count(*) from public.rpg_feedback where user_id = v_uid and created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.rpg_feedback where user_id = v_uid and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Du hast gerade schon mehrere Nachrichten geschickt. Bitte versuch es später noch einmal.';
  end if;
  insert into public.rpg_feedback (user_id, handle, art, text, kontext)
    values (v_uid, (select handle from public.rpg_profiles where user_id = v_uid), p_art, v_text, v_k);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rpg_admin_feedback(p_nur_neu boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.rpg_ist_admin() then raise exception 'Nur Admins lesen die Nachrichten.'; end if;
  return jsonb_build_object(
    'neu', (select count(*) from public.rpg_feedback where gelesen_at is null),
    'gesamt', (select count(*) from public.rpg_feedback),
    'liste', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'art', f.art, 'text', f.text, 'von', f.handle, 'am', f.created_at, 'gelesen', f.gelesen_at is not null, 'kontext', f.kontext) order by f.created_at desc)
      from (select * from public.rpg_feedback where not coalesce(p_nur_neu, false) or gelesen_at is null order by created_at desc limit 200) f), '[]'::jsonb));
end;
$$;

create or replace function public.rpg_admin_feedback_read(p_id uuid, p_gelesen boolean default true)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.rpg_ist_admin() then raise exception 'Nur Admins lesen die Nachrichten.'; end if;
  if p_id is null then update public.rpg_feedback set gelesen_at = now() where gelesen_at is null;                      -- ohne Kennung: alle als gelesen markieren
  else update public.rpg_feedback set gelesen_at = case when coalesce(p_gelesen, true) then coalesce(gelesen_at, now()) else null end where id = p_id; end if;
  return public.rpg_admin_feedback(false);
end;
$$;

revoke all on function public.rpg_feedback_send(text, text, jsonb), public.rpg_admin_feedback(boolean), public.rpg_admin_feedback_read(uuid, boolean) from public, anon;
grant execute on function public.rpg_feedback_send(text, text, jsonb), public.rpg_admin_feedback(boolean), public.rpg_admin_feedback_read(uuid, boolean) to authenticated;

commit;
