-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 029 (Helden-Skins).
\set ON_ERROR_STOP on
-- 1 = Sk_Anna (hat Ragnar, 1000 Splitter), 2 = Sk_Ben (hat Ragnar nicht, 5000), 3 = Gast, 4 = Sk_Cara (hat Ragnar, 100)
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000029a1', false), ('00000000-0000-0000-0000-0000000029a2', false), ('00000000-0000-0000-0000-0000000029a3', true), ('00000000-0000-0000-0000-0000000029a4', false);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000029a1', 'Sk_Anna'), ('00000000-0000-0000-0000-0000000029a2', 'Sk_Ben'), ('00000000-0000-0000-0000-0000000029a4', 'Sk_Cara');
insert into public.rpg_hero_collection (user_id, hero_id, quelle) values ('00000000-0000-0000-0000-0000000029a1', 'berserker', 'start'), ('00000000-0000-0000-0000-0000000029a1', 'trickser', 'start'),
  ('00000000-0000-0000-0000-0000000029a2', 'trickser', 'start'), ('00000000-0000-0000-0000-0000000029a4', 'berserker', 'start');
insert into public.rpg_wallet (user_id, betrag) values ('00000000-0000-0000-0000-0000000029a1', 1000), ('00000000-0000-0000-0000-0000000029a2', 5000), ('00000000-0000-0000-0000-0000000029a4', 100) on conflict (user_id) do update set betrag = excluded.betrag;
insert into public.rpg_arena_matches (id, status, host_id, host_name, host_team, host_schnitt, guest_id) values ('00000000-0000-0000-0000-00000000029f', 'laeuft', '00000000-0000-0000-0000-0000000029a1', 'Sk_Anna', '[]'::jsonb, 1, '00000000-0000-0000-0000-0000000029a4');
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000029a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
create function pg_temp.geld(p int) returns integer language sql security definer as $$ select betrag from public.rpg_wallet where user_id = ('00000000-0000-0000-0000-0000000029a' || p)::uuid; $$;
create function pg_temp.helden() returns integer language sql security definer as $$ select count(*)::int from public.rpg_hero_catalog; $$;
grant execute on all functions in schema pg_temp to authenticated;
set role authenticated;

select pg_temp.als(1);
select pg_temp.fehler('select * from public.rpg_skin_owned', 'permission denied', 'Die Tabellen sind nicht direkt lesbar');
select pg_temp.fehler('insert into public.rpg_skin_owned (user_id, skin_id, preis) values (''00000000-0000-0000-0000-0000000029a1'', ''berserker_wolfsblut'', 0)', 'permission denied', 'Einen Skin kann man sich nicht selbst eintragen');
select pg_temp.fehler('select public.rpg_skins_von(''00000000-0000-0000-0000-0000000029a4'')', 'permission denied', 'Fremde Skins lassen sich nicht direkt abfragen');
select public.rpg_skins() as s1 \gset
select pg_temp.ok((:'s1'::jsonb->>'konto')::boolean and (:'s1'::jsonb->>'waehrung')::int = 1000 and :'s1'::jsonb->'katalog'->0->>'id' = 'berserker_wolfsblut' and :'s1'::jsonb->'katalog'->0->>'held' = 'berserker'
  and (:'s1'::jsonb->'katalog'->0->>'preis')::int = 650 and not (:'s1'::jsonb->'katalog'->0->>'besitzt')::boolean and (:'s1'::jsonb->'katalog'->0->>'hat_held')::boolean and :'s1'::jsonb->'aktiv' = '{}'::jsonb,
  'Katalog: Wolfsblut für Ragnar, 650 Seelensplitter, noch nicht gekauft');
select pg_temp.fehler('select public.rpg_skin_equip(''berserker'', ''berserker_wolfsblut'')', 'besitzt du nicht', 'Anlegen ohne Kauf: abgelehnt');
select public.rpg_skin_buy('berserker_wolfsblut') as s2 \gset
select pg_temp.ok((:'s2'::jsonb->>'waehrung')::int = 350 and (:'s2'::jsonb->'katalog'->0->>'besitzt')::boolean and pg_temp.geld(1) = 350, 'Gekauft: 650 Seelensplitter abgebucht, der Skin gehört Anna');
select pg_temp.fehler('select public.rpg_skin_buy(''berserker_wolfsblut'')', 'besitzt du schon', 'Zweimal kaufen geht nicht');
select pg_temp.ok(pg_temp.geld(1) = 350, '… und kostet nichts');
select pg_temp.fehler('select public.rpg_skin_buy(''gibt_es_nicht'')', 'führt der Händler nicht', 'Unbekannter Skin: abgelehnt');
select pg_temp.fehler('select public.rpg_skin_equip(''trickser'', ''berserker_wolfsblut'')', 'besitzt du nicht für diesen Helden', 'Ein Skin passt nur zu seinem Helden');
select pg_temp.ok(public.rpg_skin_equip('berserker', 'berserker_wolfsblut')->'aktiv'->>'berserker' = 'berserker_wolfsblut', 'Angelegt: Ragnar trägt Wolfsblut');
select pg_temp.ok(public.rpg_skin_equip('berserker', null)->'aktiv' = '{}'::jsonb, 'Abgelegt: Ragnar sieht wieder normal aus');
select pg_temp.ok(public.rpg_skin_equip('berserker', 'berserker_wolfsblut')->'aktiv'->>'berserker' = 'berserker_wolfsblut', 'Wieder angelegt');

select pg_temp.ok(jsonb_array_length(public.rpg_skins()->'katalog') = 3 + 3 * pg_temp.helden() and public.rpg_skins()->'katalog' @> '[{"id":"inquisitor_s1","held":"inquisitor","preis":650}]'::jsonb and public.rpg_skins()->'katalog'->2->>'id' = 'gelehrter_sternenkunde' and public.rpg_skins()->'katalog'->1->>'id' = 'assassine_rabenschatten' and public.rpg_skins()->'katalog'->1->>'held' = 'assassine' and not (public.rpg_skins()->'katalog'->1->>'hat_held')::boolean, 'Katalog: Wolfsblut, Rabenschatten (Vex – Anna hat Vex nicht), Sternenkunde und je Held drei Vorab-Plätze zu 650');
select pg_temp.als(2);
select pg_temp.ok(not (public.rpg_skins()->'katalog'->0->>'hat_held')::boolean, 'Ben hat Ragnar nicht: Der Katalog zeigt das an');
select pg_temp.fehler('select public.rpg_skin_buy(''berserker_wolfsblut'')', 'Helden hast du noch nicht', 'Ohne den Helden kein Kauf');
select pg_temp.ok(pg_temp.geld(2) = 5000, '… und es wird nichts abgebucht');
select pg_temp.fehler('select public.rpg_arena_skins(''00000000-0000-0000-0000-00000000029f'')', 'gibt es nicht', 'Wer nicht mitkämpft, sieht die Skins eines Kampfes nicht');
select pg_temp.als(4);
select pg_temp.fehler('select public.rpg_skin_buy(''berserker_wolfsblut'')', 'reichen deine Seelensplitter nicht', 'Ohne genug Seelensplitter kein Kauf');
select public.rpg_arena_skins('00000000-0000-0000-0000-00000000029f') as a1 \gset
select pg_temp.ok(:'a1'::jsonb->'host'->>'berserker' = 'berserker_wolfsblut' and :'a1'::jsonb->'gast' = '{}'::jsonb, 'Arena: Die Gegnerin sieht, dass Annas Ragnar Wolfsblut trägt');
select pg_temp.als(3);
select pg_temp.ok(not (public.rpg_skins()->>'konto')::boolean, 'Gäste: keine Skins');
select pg_temp.fehler('select public.rpg_skin_buy(''berserker_wolfsblut'')', 'nur mit Spielerkonten', 'Gäste können nicht kaufen');
reset role;
