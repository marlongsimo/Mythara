-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 030 (Skin-Pakete).
\set ON_ERROR_STOP on
-- 1 = Pk_Anna (3000 Splitter, hat keinen der Helden), 2 = Pk_Ben (1000), 3 = Gast, 4 = Pk_Cara (2000, hat Faye und schon deren Skin)
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000030a1', false), ('00000000-0000-0000-0000-0000000030a2', false), ('00000000-0000-0000-0000-0000000030a3', true), ('00000000-0000-0000-0000-0000000030a4', false);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000030a1', 'Pk_Anna'), ('00000000-0000-0000-0000-0000000030a2', 'Pk_Ben'), ('00000000-0000-0000-0000-0000000030a4', 'Pk_Cara');
insert into public.rpg_hero_collection (user_id, hero_id, quelle) values ('00000000-0000-0000-0000-0000000030a1', 'trickser', 'start'), ('00000000-0000-0000-0000-0000000030a4', 'tiergefaehrte', 'start');
insert into public.rpg_wallet (user_id, betrag) values ('00000000-0000-0000-0000-0000000030a1', 3000), ('00000000-0000-0000-0000-0000000030a2', 1000), ('00000000-0000-0000-0000-0000000030a4', 2000) on conflict (user_id) do update set betrag = excluded.betrag;
insert into public.rpg_skin_owned (user_id, skin_id, preis) values ('00000000-0000-0000-0000-0000000030a4', 'tiergefaehrte_s2', 650);
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000030a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
create function pg_temp.geld(p int) returns integer language sql security definer as $$ select betrag from public.rpg_wallet where user_id = ('00000000-0000-0000-0000-0000000030a' || p)::uuid; $$;
create function pg_temp.skins(p int) returns integer language sql security definer as $$ select count(*)::int from public.rpg_skin_owned where user_id = ('00000000-0000-0000-0000-0000000030a' || p)::uuid; $$;
create function pg_temp.ende(t interval) returns void language sql security definer as $$ update public.rpg_skin_bundles set bis = now() + t where id = 'schattenreich'; $$;
create function pg_temp.laufzeit() returns interval language sql security definer as $$ select bis - von from public.rpg_skin_bundles where id = 'schattenreich'; $$;
grant execute on all functions in schema pg_temp to authenticated;
select pg_temp.ok(pg_temp.laufzeit() = interval '7 days', 'Das Paket läuft sieben Tage (erneutes Einspielen verlängert es nicht)');
set role authenticated;
select pg_temp.als(1);
select pg_temp.fehler('select * from public.rpg_skin_bundles', 'permission denied', 'Die Tabellen sind nicht direkt lesbar');
select public.rpg_skin_bundles_list() as l1 \gset
select pg_temp.ok((:'l1'::jsonb->>'konto')::boolean and jsonb_array_length(:'l1'::jsonb->'pakete') = 1 and :'l1'::jsonb->'pakete'->0->>'id' = 'schattenreich' and (:'l1'::jsonb->'pakete'->0->>'preis')::int = 1365
  and (:'l1'::jsonb->'pakete'->0->>'einzeln')::int = 1950 and :'l1'::jsonb->'pakete'->0->'skins' = '["assassine_s1","tiergefaehrte_s2","wanderheiler_s2"]'::jsonb and not (:'l1'::jsonb->'pakete'->0->>'gekauft')::boolean
  and (:'l1'::jsonb->'pakete'->0->>'bis')::timestamptz > now() + interval '6 days', 'Liste: „schattenreich“ mit drei Skins, 1365 statt 1950, läuft noch');
select public.rpg_skin_bundle_buy('schattenreich') as k1 \gset
select pg_temp.ok(pg_temp.geld(1) = 1635 and pg_temp.skins(1) = 3 and (:'k1'::jsonb->'pakete'->0->>'gekauft')::boolean and (:'k1'::jsonb->>'waehrung')::int = 1635, 'Gekauft: 1365 Seelensplitter weg, alle drei Skins im Besitz – auch ohne die Helden');
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''schattenreich'')', 'besitzt du schon', 'Zweimal kaufen geht nicht');
select pg_temp.ok(pg_temp.geld(1) = 1635 and (public.rpg_skins()->'katalog' @> '[{"id":"assassine_s1","besitzt":true}]'::jsonb), '… kostet nichts, und die Skins stehen im normalen Skin-Katalog als gekauft');
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''gibt_es_nicht'')', 'gibt es nicht mehr', 'Unbekanntes Paket: abgelehnt');
select pg_temp.als(2);
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''schattenreich'')', 'reichen deine Seelensplitter nicht', 'Ohne genug Seelensplitter kein Kauf');
select pg_temp.ok(pg_temp.geld(2) = 1000 and pg_temp.skins(2) = 0, '… und nichts wird abgebucht oder vergeben');
select pg_temp.als(4);
select pg_temp.ok(public.rpg_skin_bundles_list()->'pakete'->0->'hat' = '["tiergefaehrte_s2"]'::jsonb, 'Cara hat einen der Skins schon: Die Liste zeigt das');
select public.rpg_skin_bundle_buy('schattenreich') as k4 \gset
select pg_temp.ok(pg_temp.geld(4) = 635 and pg_temp.skins(4) = 3, 'Sie bekommt die beiden fehlenden zum Paketpreis');
select pg_temp.als(3);
select pg_temp.ok(not (public.rpg_skin_bundles_list()->>'konto')::boolean, 'Gäste: keine Pakete');
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''schattenreich'')', 'nur mit Spielerkonten', 'Gäste können nicht kaufen');
select pg_temp.als(2);
select pg_temp.ende(interval '-1 minute');
select pg_temp.ok(jsonb_array_length(public.rpg_skin_bundles_list()->'pakete') = 0, 'Nach Ablauf verschwindet das Paket aus der Liste');
select pg_temp.fehler('select public.rpg_skin_bundle_buy(''schattenreich'')', 'gibt es nicht mehr', '… und lässt sich nicht mehr kaufen');
select pg_temp.ok(public.rpg_skins()->'katalog' @> '[{"id":"wanderheiler_s2","preis":650}]'::jsonb, 'Die Skins bleiben einzeln für 650 beim Händler');
reset role;
