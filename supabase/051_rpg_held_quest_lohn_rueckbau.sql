-- MYTHARA · RPG · Rückbau Migration 051: Quest-Lohn wieder höchstens 1.000 XP je Skill und Beruf (die Funktion genau wie in Migration 048).
-- Schon gebuchte Belohnungen bleiben, wie sie sind.
begin;
create or replace function public.rpg_held_quest_abschluss_v2(p_user uuid, p_quest text, p_xp jsonb, p_berufe jsonb, p_punkte integer)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare
  c_je constant integer := 1000;
  c_punkte constant integer := 10;
  c_max constant bigint := floor(100 * (power(100::numeric, 2.2) - 1));
  c_beruf_max constant bigint := 200000000;
  x jsonb := coalesce(p_xp, '{}'::jsonb);
  b jsonb := coalesce(p_berufe, '{}'::jsonb);
  k text; v jsonb; berufe jsonb := '{}'::jsonb; n integer;
begin
  if p_user is null then raise exception 'Spieler fehlt.'; end if;
  if p_quest is null or p_quest !~ '^[a-z0-9_]{1,40}$' then raise exception 'Unbekannte Quest-ID.'; end if;
  if jsonb_typeof(x) <> 'object' or jsonb_typeof(b) <> 'object' then raise exception 'XP müssen als Objekt kommen.'; end if;
  if coalesce(p_punkte, 0) < 0 then raise exception 'Negative Questpunkte sind nicht erlaubt.'; end if;
  for k, v in select * from jsonb_each(x) loop
    if k not in ('geschick', 'staerke', 'fernkampf', 'magie', 'lp', 'defense') then raise exception 'Unbekannter Kampfskill: %', k; end if;
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
  end loop;
  for k, v in select * from jsonb_each(b) loop
    if k !~ '^[a-z]{3,20}$' then raise exception 'Unbekannter Beruf: %', k; end if;
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric < 0 then raise exception 'Negative XP sind nicht erlaubt.'; end if;
    berufe := berufe || jsonb_build_object(k, least(floor((v #>> '{}')::numeric), c_je));
  end loop;
  update public.rpg_held h set
      quests          = jsonb_set(quests, array[p_quest], jsonb_build_object('s', 'fertig', 'z', extract(epoch from now())::bigint)),
      skill_geschick  = least(c_max, skill_geschick  + least(floor(coalesce((x ->> 'geschick')::numeric, 0)),  c_je)),
      skill_staerke   = least(c_max, skill_staerke   + least(floor(coalesce((x ->> 'staerke')::numeric, 0)),   c_je)),
      skill_fernkampf = least(c_max, skill_fernkampf + least(floor(coalesce((x ->> 'fernkampf')::numeric, 0)), c_je)),
      skill_magie     = least(c_max, skill_magie     + least(floor(coalesce((x ->> 'magie')::numeric, 0)),     c_je)),
      skill_lp        = least(700000, skill_lp       + least(floor(coalesce((x ->> 'lp')::numeric, 0)),        c_je)),
      skill_defense   = least(1400000, skill_defense + least(floor(coalesce((x ->> 'defense')::numeric, 0)),   c_je)),
      inventar        = case when h.inventar is null or berufe = '{}'::jsonb then h.inventar
                             else jsonb_set(h.inventar, '{berufe}', coalesce((select jsonb_object_agg(key, value) from (
                                    select key, to_jsonb(least(c_beruf_max, coalesce((h.inventar -> 'berufe' ->> key)::bigint, 0) + (value #>> '{}')::bigint)) as value
                                    from jsonb_each(berufe)
                                    union all
                                    select key, value from jsonb_each(case when jsonb_typeof(h.inventar -> 'berufe') = 'object' then h.inventar -> 'berufe' else '{}'::jsonb end)
                                    where not berufe ? key) t), '{}'::jsonb)) end,
      questpunkte     = questpunkte + least(coalesce(p_punkte, 0), c_punkte),
      updated_at      = now()
    where user_id = p_user and coalesce(quests -> p_quest ->> 's', '') <> 'fertig';
  get diagnostics n = row_count; return n > 0;  -- false: schon abgeschlossen (keine zweite Belohnung) oder kein Held
end;
$$;
revoke all on function public.rpg_held_quest_abschluss_v2(uuid, text, jsonb, jsonb, integer) from public, anon, authenticated;
grant execute on function public.rpg_held_quest_abschluss_v2(uuid, text, jsonb, jsonb, integer) to service_role;
commit;
