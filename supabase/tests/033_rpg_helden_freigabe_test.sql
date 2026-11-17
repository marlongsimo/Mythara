-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 033 (Helden freigeben, Start-Angebot).
\set ON_ERROR_STOP on
-- 1 = Hf_Anna (3000 Splitter), 2 = Hf_Chef (Admin, 5000, besitzt Thessa nach der Freigabe schon), 3 = Gast, 4 = Hf_Arm (500)
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000033a1', false), ('00000000-0000-0000-0000-0000000033a2', false), ('00000000-0000-0000-0000-0000000033a3', true), ('00000000-0000-0000-0000-0000000033a4', false);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000033a1', 'Hf_Anna'), ('00000000-0000-0000-0000-0000000033a2', 'Hf_Chef'), ('00000000-0000-0000-0000-0000000033a4', 'Hf_Arm');
insert into public.rpg_admins (user_id) values ('00000000-0000-0000-0000-0000000033a2') on conflict do nothing;
insert into public.rpg_hero_collection (user_id, hero_id, quelle) values ('00000000-0000-0000-0000-0000000033a1', 'trickser', 'start'), ('00000000-0000-0000-0000-0000000033a2', 'trickser', 'start'), ('00000000-0000-0000-0000-0000000033a4', 'trickser', 'start');
insert into public.rpg_wallet (user_id, betrag) values ('00000000-0000-0000-0000-0000000033a1', 3000), ('00000000-0000-0000-0000-0000000033a2', 5000), ('00000000-0000-0000-0000-0000000033a4', 500) on conflict (user_id) do update set betrag = excluded.betrag;
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000033a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
create function pg_temp.geld(p int) returns integer language sql security definer as $$ select betrag from public.rpg_wallet where user_id = ('00000000-0000-0000-0000-0000000033a' || p)::uuid; $$;
create function pg_temp.hat(p int) returns text language sql security definer as $$
  select (select count(*) from public.rpg_hero_collection where user_id = u and hero_id = 'runenklinge') || '/' || (select count(*) from public.rpg_skin_owned where user_id = u and skin_id = 'runenklinge_s1')
    || '/' || coalesce((select anzahl from public.rpg_xp_inventory where user_id = u and pack_id = 'gross'), 0) || '/' || coalesce((select anzahl from public.rpg_xp_inventory where user_id = u and pack_id = 'mittel'), 0)
  from (select ('00000000-0000-0000-0000-0000000033a' || p)::uuid as u) x; $$;
create function pg_temp.im_katalog() returns boolean language sql security definer as $$ select exists (select 1 from public.rpg_hero_catalog where hero_id = 'runenklinge'); $$;
create function pg_temp.ende(t interval) returns void language sql security definer as $$ update public.rpg_launch_offers set bis = now() + t; $$;
grant execute on all functions in schema pg_temp to authenticated;
select pg_temp.ok(not pg_temp.im_katalog(), 'Nach dem Einspielen ist Thessa NICHT im Heldenkatalog – freigegeben wird erst mit dem Schalter');
set role authenticated;
select pg_temp.als(1);
select pg_temp.ok(not (public.rpg_hero_katalog() ? 'runenklinge') and jsonb_array_length(public.rpg_hero_katalog()) = 15 and public.rpg_launch_list()->'angebote' = '[]'::jsonb, 'Vor der Freigabe: 15 Helden im Katalog, kein Start-Angebot');
select pg_temp.fehler('select public.rpg_hero_buy(''runenklinge'', ''splitter'')', 'gibt es nicht', 'Vor der Freigabe lässt sich Thessa nicht kaufen');
select pg_temp.fehler('select public.rpg_admin_hero_release(''runenklinge'')', 'Nur Admins', 'Spieler können den Schalter nicht umlegen');
select pg_temp.fehler('select public.rpg_admin_hero_plan()', 'Nur Admins', '… und den Plan nicht sehen');
select pg_temp.fehler('select * from public.rpg_hero_geplant', 'permission denied', 'Die Tabellen sind nicht direkt lesbar');
select pg_temp.als(2);
select pg_temp.ok(public.rpg_admin_hero_plan() @> '[{"held":"runenklinge","klasse":"zauberer","skin":"runenklinge_s1","preis":1698,"tage":5,"freigegeben":null}]'::jsonb, 'Admin sieht den Plan: Thessa, Skin, 1698, fünf Tage, noch nicht freigegeben');
select pg_temp.fehler('select public.rpg_admin_hero_release(''niemand'')', 'keine Freigabe vorbereitet', 'Unbekannter Held: abgelehnt');
select public.rpg_admin_hero_release('runenklinge') as r1 \gset
select pg_temp.ok(:'r1'::jsonb->0->>'freigegeben' is not null and (:'r1'::jsonb->0->>'angebot_bis')::timestamptz between now() + interval '4 days 23 hours' and now() + interval '5 days 1 minute' and pg_temp.im_katalog(), 'Schalter umgelegt: Thessa ist im Katalog, das Angebot läuft fünf Tage');
select pg_temp.fehler('select public.rpg_admin_hero_release(''runenklinge'')', 'schon freigegeben', 'Ein zweites Mal geht nicht');
select pg_temp.ok(public.rpg_hero_katalog() ? 'runenklinge' and jsonb_array_length(public.rpg_hero_katalog()) = 16, 'Das Spiel erfährt es: 16 Helden im Katalog');
select pg_temp.ok((public.rpg_hero_buy('runenklinge', 'splitter')->>'held_neu') = 'runenklinge' and pg_temp.geld(2) = 4170, 'Thessa ist jetzt wie jeder Held für 830 Seelensplitter zu haben');
select public.rpg_launch_list() as l2 \gset
select pg_temp.ok((:'l2'::jsonb->'angebote'->0->>'hat_held')::boolean and not (:'l2'::jsonb->'angebote'->0->>'gekauft')::boolean, 'Wer Thessa schon hat, sieht das Angebot weiter');
select pg_temp.ok((public.rpg_launch_buy('runenklinge')->'angebote'->0->>'gekauft')::boolean and pg_temp.geld(2) = 4170 - 1698 and pg_temp.hat(2) = '1/1/2/1', '… und kann es zum vollen Angebotspreis kaufen: Skin und Pakete kommen dazu');
select pg_temp.als(1);
select public.rpg_launch_list() as l1 \gset
select pg_temp.ok(jsonb_array_length(:'l1'::jsonb->'angebote') = 1 and :'l1'::jsonb->'angebote'->0 @> '{"id":"runenklinge","held":"runenklinge","skin":"runenklinge_s1","preis":1698,"einzeln":2830,"ep":850,"hat_held":false,"hat_skin":false,"gekauft":false}'::jsonb,
  'Start-Angebot: Thessa, Skin und 850 EP für 1698 statt 2830');
select pg_temp.ok(public.rpg_skins()->'katalog' @> '[{"id":"runenklinge_s1","held":"runenklinge","preis":650}]'::jsonb, 'Der Skin steht auch einzeln für 650 im Skin-Katalog');
select public.rpg_launch_buy('runenklinge') as k1 \gset
select pg_temp.ok(pg_temp.geld(1) = 1302 and pg_temp.hat(1) = '1/1/2/1' and (:'k1'::jsonb->'angebote'->0->>'gekauft')::boolean, 'Gekauft: 1698 Seelensplitter weg; Thessa, der Skin, zwei große und ein mittleres Erfahrungspaket sind da');
select pg_temp.ok(public.rpg_xp_shop()->'pakete' @> '[{"id":"gross","besitz":2}]'::jsonb, 'Die Pakete liegen im normalen Vorrat beim Händler');
select pg_temp.fehler('select public.rpg_launch_buy(''runenklinge'')', 'schon gekauft', 'Zweimal kaufen geht nicht');
select pg_temp.als(4);
select pg_temp.fehler('select public.rpg_launch_buy(''runenklinge'')', 'reichen deine Seelensplitter nicht', 'Ohne genug Seelensplitter kein Kauf');
select pg_temp.ok(pg_temp.geld(4) = 500 and pg_temp.hat(4) = '0/0/0/0', '… und nichts wird abgebucht oder vergeben');
select pg_temp.als(3);
select pg_temp.ok(not (public.rpg_launch_list()->>'konto')::boolean, 'Gäste: kein Start-Angebot');
select pg_temp.als(4);
select pg_temp.ende(interval '-1 minute');
select pg_temp.ok(public.rpg_launch_list()->'angebote' = '[]'::jsonb, 'Nach fünf Tagen verschwindet das Angebot');
select pg_temp.fehler('select public.rpg_launch_buy(''runenklinge'')', 'gibt es nicht mehr', '… und lässt sich nicht mehr kaufen');
select pg_temp.ok(public.rpg_hero_katalog() ? 'runenklinge', 'Thessa bleibt danach normal erhältlich');
reset role;
