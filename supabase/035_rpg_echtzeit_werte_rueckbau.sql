-- MYTHARA · RPG · Rückbau von Migration 035 (EP und Seelensplitter der Splitterlande).
-- ACHTUNG: löscht alle vom Server gutgeschriebenen EP und Seelensplitter samt Protokoll. Der Spielstand aus Migration 034 bleibt.
begin;
drop function if exists public.rpg_echtzeit_gutschrift(uuid, jsonb, integer, text);
drop function if exists public.rpg_echtzeit_werte();
drop table if exists public.rpg_echtzeit_kaempfe;
drop table if exists public.rpg_echtzeit_werte;
commit;
