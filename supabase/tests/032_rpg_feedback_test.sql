-- NUR FÜR LOKALE TESTS – NIEMALS IN SUPABASE AUSFÜHREN. Prüft Migration 032 (Feedback).
\set ON_ERROR_STOP on
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000032a1', false), ('00000000-0000-0000-0000-0000000032a2', false), ('00000000-0000-0000-0000-0000000032a3', true);
insert into public.rpg_profiles (user_id, handle) values ('00000000-0000-0000-0000-0000000032a1', 'Fb_Anna'), ('00000000-0000-0000-0000-0000000032a2', 'Fb_Chef');
insert into public.rpg_admins (user_id) values ('00000000-0000-0000-0000-0000000032a2') on conflict do nothing;
create function pg_temp.als(p int) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000032a' || p, false); end $$;
create function pg_temp.ok(b boolean, t text) returns void language plpgsql as $$ begin if coalesce(b, false) then raise notice '✓ %', t; else raise exception '✗ %', t; end if; end $$;
create function pg_temp.fehler(sql text, muster text, t text) returns void language plpgsql as $$
begin begin execute sql; exception when others then if sqlerrm ~ muster then raise notice '✓ % (%)', t, sqlerrm; return; end if; raise exception '✗ %: unerwartete Meldung „%“', t, sqlerrm; end;
  raise exception '✗ %: kein Fehler', t; end $$;
create function pg_temp.alt() returns void language sql security definer as $$ update public.rpg_feedback set created_at = created_at - interval '2 hours'; $$;
grant execute on all functions in schema pg_temp to authenticated;
set role authenticated;
select pg_temp.als(1);
select pg_temp.fehler('select * from public.rpg_feedback', 'permission denied', 'Die Tabelle ist nicht direkt lesbar');
select pg_temp.fehler('select public.rpg_admin_feedback(false)', 'Nur Admins', 'Spieler können fremde Nachrichten nicht lesen');
select pg_temp.fehler('select public.rpg_admin_feedback_read(null, true)', 'Nur Admins', '… und nichts als gelesen markieren');
select pg_temp.fehler('select public.rpg_feedback_send(''lob'', ''Tolles Spiel, wirklich'')', 'Feedback oder Bug', 'Unbekannte Art: abgelehnt');
select pg_temp.fehler('select public.rpg_feedback_send(''bug'', ''  ab '')', 'ein paar Worte', 'Zu kurz: abgelehnt');
select pg_temp.fehler('select public.rpg_feedback_send(''bug'', repeat(''x'', 2001))', 'zu lang', 'Zu lang: abgelehnt');
select pg_temp.ok((public.rpg_feedback_send('bug', '  Grau bleibt im Kampf stehen.  ', '{"v":"85.31","seite":"arena"}'::jsonb)->>'ok')::boolean, 'Ein Bug wird angenommen');
select pg_temp.ok((public.rpg_feedback_send('feedback', 'Die Skins sind großartig!')->>'ok')::boolean, 'Feedback ohne Angaben wird angenommen');
select public.rpg_feedback_send('feedback', 'Nachricht drei'); select public.rpg_feedback_send('feedback', 'Nachricht vier'); select public.rpg_feedback_send('feedback', 'Nachricht fünf');
select pg_temp.fehler('select public.rpg_feedback_send(''feedback'', ''Nachricht sechs'')', 'später noch einmal', 'Die sechste Nachricht in einer Stunde wird abgelehnt');
select pg_temp.als(3);
select pg_temp.fehler('select public.rpg_feedback_send(''bug'', ''Ich bin ein Gast'')', 'Spielerkonto', 'Gäste können kein Feedback senden');
select pg_temp.als(2);
select public.rpg_admin_feedback(false) as a1 \gset
select pg_temp.ok((:'a1'::jsonb->>'neu')::int = 5 and (:'a1'::jsonb->>'gesamt')::int = 5 and jsonb_array_length(:'a1'::jsonb->'liste') = 5
  and :'a1'::jsonb->'liste' @> '[{"art":"bug","text":"Grau bleibt im Kampf stehen.","von":"Fb_Anna","gelesen":false,"kontext":{"v":"85.31","seite":"arena"}}]'::jsonb, 'Admin sieht alle fünf, mit Art, Absender, gekürztem Text und den Angaben');
select pg_temp.ok((public.rpg_admin_feedback_read((:'a1'::jsonb->'liste'->0->>'id')::uuid, true)->>'neu')::int = 4, 'Eine Nachricht als gelesen markiert: noch vier ungelesen');
select pg_temp.ok(jsonb_array_length(public.rpg_admin_feedback(true)->'liste') = 4, 'Der Filter „nur ungelesene“ zeigt vier');
select pg_temp.ok((public.rpg_admin_feedback_read((:'a1'::jsonb->'liste'->0->>'id')::uuid, false)->>'neu')::int = 5, 'Wieder als ungelesen markiert');
select pg_temp.ok((public.rpg_admin_feedback_read(null, true)->>'neu')::int = 0, 'Alle als gelesen markiert');
select pg_temp.alt();
select pg_temp.als(1);
select pg_temp.ok((public.rpg_feedback_send('feedback', 'Zwei Stunden später geht es wieder')->>'ok')::boolean, 'Nach einer Stunde ist die Begrenzung wieder frei');
reset role;
