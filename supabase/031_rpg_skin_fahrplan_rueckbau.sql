-- =====================================================================
-- MYTHARA · RPG · Rückbau zu Migration 031 (Fahrplan der Skin-Pakete)
-- Entfernt die fünf geplanten Pakete und die Spalte „ab“; rpg_skins() und rpg_skin_buy() sind danach wieder wie in 029.
-- Bereits gekaufte Skins bleiben bei den Konten. ACHTUNG: Ohne „ab“ sind alle Skins sofort beim Händler sichtbar.
-- Unverändert in den Supabase SQL Editor einfügen und ausführen. Mehrfaches Ausführen ist unschädlich.
-- =====================================================================
begin;
do $$ begin if to_regclass('public.rpg_skin_bundles') is not null then
  delete from public.rpg_skin_bundle_owned where bundle_id in ('unter_dem_eis', 'glut_und_asche', 'mondbaendiger', 'goldene_garde', 'sonnengott');
  delete from public.rpg_skin_bundles where id in ('unter_dem_eis', 'glut_und_asche', 'mondbaendiger', 'goldene_garde', 'sonnengott');
end if; end $$;

create or replace function public.rpg_skins()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.rpg_sammlung_konto() then return jsonb_build_object('konto', false); end if;
  return jsonb_build_object('konto', true,
    'waehrung', coalesce((select betrag from public.rpg_wallet where user_id = v_uid), 0),
    'katalog', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'held', i.hero_id, 'preis', i.preis,
        'besitzt', exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = i.id),
        'hat_held', exists (select 1 from public.rpg_hero_collection c where c.user_id = v_uid and c.hero_id = i.hero_id)) order by i.reihe, i.id)
      from public.rpg_skin_items i where i.aktiv or exists (select 1 from public.rpg_skin_owned o where o.user_id = v_uid and o.skin_id = i.id)), '[]'::jsonb),
    'aktiv', coalesce((select jsonb_object_agg(e.hero_id, e.skin_id) from public.rpg_skin_equipped e where e.user_id = v_uid), '{}'::jsonb));
end;
$$;

create or replace function public.rpg_skin_buy(p_id text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_i public.rpg_skin_items%rowtype;
begin
  if v_uid is null or not public.rpg_sammlung_konto() then raise exception 'Der Händler handelt nur mit Spielerkonten.'; end if;
  perform pg_advisory_xact_lock(hashtext('rpg_shop:' || v_uid::text));
  select * into v_i from public.rpg_skin_items where id = p_id and aktiv;
  if not found then raise exception 'Das führt der Händler nicht.'; end if;
  if exists (select 1 from public.rpg_skin_owned where user_id = v_uid and skin_id = p_id) then raise exception 'Diesen Skin besitzt du schon.'; end if;
  if not exists (select 1 from public.rpg_hero_collection where user_id = v_uid and hero_id = v_i.hero_id) then raise exception 'Diesen Helden hast du noch nicht.'; end if;
  if v_i.preis > 0 then
    update public.rpg_wallet set betrag = betrag - v_i.preis, updated_at = now() where user_id = v_uid and betrag >= v_i.preis;
    if not found then raise exception 'Dafür reichen deine Seelensplitter nicht.'; end if;
  end if;
  insert into public.rpg_skin_owned (user_id, skin_id, preis) values (v_uid, p_id, v_i.preis);
  return public.rpg_skins();
end;
$$;

alter table public.rpg_skin_items drop column if exists ab;
commit;
