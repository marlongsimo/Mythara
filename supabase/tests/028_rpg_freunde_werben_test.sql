-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 028 (Freunde werben).
\set ON_ERROR_STOP on
-- W1 = Werberin (Fw_Wanda), W2 = neuer Freund (Fw_Neo), W3 = altes Konto (Fw_Alt), W4 = Gast, W5 = zweiter Freund (Fw_Zwo)
insert into auth.users (id, is_anonymous, created_at) values
  ('00000000-0000-0000-0000-0000000028a1', false, now() - interval '90 days'), ('00000000-0000-0000-0000-0000000028a2', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000028a3', false, now() - interval '30 days'), ('00000000-0000-0000-0000-0000000028a4', true, now()),
  ('00000000-0000-0000-0000-0000000028a5', false, now() - interval '2 days');
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000028a1', 'Fw_Wanda'), ('00000000-0000-0000-0000-0000000028a2', 'Fw_Neo'),
  ('00000000-0000-0000-0000-0000000028a3', 'Fw_Alt'), ('00000000-0000-0000-0000-0000000028a5', 'Fw_Zwo');
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000028a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
create function pg_temp.kampagne(p_ab text, p_szene text) returns uuid language plpgsql as $$
declare v_k uuid;
begin
  v_k := public.rpg_create_campaign('Test ' || p_ab, 'normal', 'Spieltisch', p_ab);
  for i in 1..8 loop perform public.rpg_save_snapshot(v_k, i - 1, jsonb_build_object('abenteuer', jsonb_build_object('abenteuer', p_ab, 'szene', case when i = 8 then p_szene else 'szene_' || i end))); end loop;
  perform public.rpg_set_campaign_status(v_k, 'abgeschlossen');
  return v_k;
end $$;
create function pg_temp.alt(p uuid) returns void language sql security definer as $$ update public.rpg_campaigns set created_at = now() - interval '2 hours' where id = p; $$;
create function pg_temp.tokens(p int) returns integer language sql security definer as $$ select coalesce((select anzahl from public.rpg_hero_tokens where user_id = ('00000000-0000-0000-0000-0000000028a' || p)::uuid), 0); $$;
create function pg_temp.voll() returns void language sql security definer as $$
  insert into auth.users (id, is_anonymous) select ('00000000-0000-0000-0000-00000028b' || lpad(g::text, 3, '0'))::uuid, false from generate_series(1, 4) g;
  insert into public.rpg_referrals (invitee, referrer, rewarded_at) select ('00000000-0000-0000-0000-00000028b' || lpad(g::text, 3, '0'))::uuid, '00000000-0000-0000-0000-0000000028a1', now() from generate_series(1, 4) g; $$;
grant execute on all functions in schema pg_temp to authenticated;
select pg_temp.ok(public.rpg_referral_max() = 5 and public.rpg_referral_frist() = interval '14 days', 'Stellschrauben: höchstens 5 belohnte Freunde, ein Konto gilt 14 Tage als neu');
set role authenticated;

-- ---------- Eintragen ----------
select pg_temp.als(2);
select pg_temp.fehler('select * from public.rpg_referrals', 'permission denied', 'Die Tabelle ist nicht direkt lesbar');
select pg_temp.fehler('insert into public.rpg_referrals (invitee, referrer) values (''00000000-0000-0000-0000-0000000028a2'', ''00000000-0000-0000-0000-0000000028a1'')', 'permission denied', 'Die Tabelle ist nicht direkt beschreibbar');
select pg_temp.fehler('select public.rpg_referral_belohnen()', 'permission denied|trigger', 'Die Belohnungsfunktion lässt sich nicht direkt aufrufen');
select pg_temp.ok(public.rpg_referral_set('Niemand_Da')->>'grund' = 'unbekannt' and public.rpg_referral_set('')->>'grund' = 'unbekannt' and public.rpg_referral_set(null)->>'grund' = 'unbekannt', 'Unbekannter oder leerer Name: nichts eingetragen');
select pg_temp.ok(public.rpg_referral_set('fw_neo')->>'grund' = 'selbst', 'Sich selbst werben geht nicht');
select public.rpg_referral_set('  fw_WANDA ') as s1 \gset
select pg_temp.ok((:'s1'::jsonb->>'ok')::boolean and :'s1'::jsonb->>'von' = 'Fw_Wanda', 'Ein neues Konto trägt seine Werberin ein (Groß- und Kleinschreibung egal)');
select pg_temp.ok(public.rpg_referral_set('Fw_Alt')->>'grund' = 'schon', 'Ein zweiter Werber lässt sich nicht nachtragen');
select pg_temp.als(3);
select pg_temp.ok(public.rpg_referral_set('Fw_Wanda')->>'grund' = 'alt', 'Ein Konto, das älter als 14 Tage ist, kann sich nicht mehr werben lassen');
select pg_temp.als(4);
select pg_temp.ok(public.rpg_referral_set('Fw_Wanda')->>'grund' = 'konto' and not (public.rpg_referral_status()->>'konto')::boolean, 'Gäste ohne Konto nehmen nicht teil');

-- ---------- Stand vor der Belohnung ----------
select pg_temp.als(1);
select public.rpg_referral_status() as st1 \gset
select pg_temp.ok(:'st1'::jsonb->>'name' = 'Fw_Wanda' and (:'st1'::jsonb->>'offen')::int = 1 and (:'st1'::jsonb->>'belohnt')::int = 0 and (:'st1'::jsonb->>'max')::int = 5
  and :'st1'::jsonb->'freunde'->0->>'name' = 'Fw_Neo' and not (:'st1'::jsonb->'freunde'->0->>'belohnt')::boolean and pg_temp.tokens(1) = 0, 'Die Werberin sieht ihren Freund als offen und hat noch keinen Token');
select pg_temp.als(2);
select pg_temp.ok(public.rpg_referral_status()->>'von' = 'Fw_Wanda' and not (public.rpg_referral_status()->>'selbst_belohnt')::boolean, 'Der Freund sieht, wer ihn geworben hat');

-- ---------- Belohnung beim ersten Kampagnen-Ende ----------
select pg_temp.kampagne('rabenmoor', 'ende_erloest') as k1 \gset
select pg_temp.alt(:'k1');
select public.rpg_claim_ending(:'k1') as e1 \gset
select pg_temp.ok(pg_temp.tokens(1) = 1 and pg_temp.tokens(2) = 1 and (public.rpg_referral_status()->>'selbst_belohnt')::boolean, 'Der Freund beendet seine erste Kampagne: Beide bekommen je einen Heldentoken');
select public.rpg_claim_ending(:'k1') as e1b \gset
select pg_temp.kampagne('rabenmoor', 'ende_erloest') as k2 \gset
select pg_temp.alt(:'k2');
select public.rpg_claim_ending(:'k2') as e2 \gset
select pg_temp.ok(pg_temp.tokens(1) = 1 and pg_temp.tokens(2) = 1, 'Dieselbe Meldung noch einmal und eine zweite Kampagne bringen keinem von beiden einen weiteren Token');
select pg_temp.als(1);
select public.rpg_referral_status() as st2 \gset
select pg_temp.ok((:'st2'::jsonb->>'offen')::int = 0 and (:'st2'::jsonb->>'belohnt')::int = 1 and (:'st2'::jsonb->'freunde'->0->>'belohnt')::boolean, 'Der Stand zeigt den Freund jetzt als belohnt');

-- ---------- Wer schon gespielt hat, lässt sich nicht mehr werben ----------
select pg_temp.als(5);
select pg_temp.kampagne('rabenmoor', 'ende_erloest') as k3 \gset
select pg_temp.alt(:'k3');
select public.rpg_claim_ending(:'k3') as e3 \gset
select pg_temp.ok(public.rpg_referral_set('Fw_Wanda')->>'grund' = 'gespielt' and pg_temp.tokens(1) = 1, 'Wer schon eine Kampagne beendet hat, kann nachträglich niemanden mehr als Werber eintragen');

-- ---------- Obergrenze ----------
reset role;
select pg_temp.voll();
delete from public.rpg_ending_claims where user_id = '00000000-0000-0000-0000-0000000028a5';
set role authenticated;
select pg_temp.als(5);
select pg_temp.ok((public.rpg_referral_set('Fw_Wanda')->>'ok')::boolean, 'Vorbereitung: zweiter Freund eingetragen, die Werberin hat schon 5 belohnte Freunde');
select pg_temp.kampagne('rabenmoor', 'ende_erloest') as k4 \gset
select pg_temp.alt(:'k4');
select public.rpg_claim_ending(:'k4') as e4 \gset
select pg_temp.als(1);
select pg_temp.ok(pg_temp.tokens(1) = 1 and pg_temp.tokens(5) = 1 and (public.rpg_referral_status()->>'belohnt')::int = 5 and (public.rpg_referral_status()->>'offen')::int = 1, 'Ab dem sechsten Freund bekommt die Werberin keinen Token mehr (Obergrenze 5) – der Freund bekommt seinen trotzdem');
reset role;
