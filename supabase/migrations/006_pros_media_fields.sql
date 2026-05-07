-- Migration 006 — Ajout colonnes media / réseaux sociaux sur sc_pros
alter table sc_pros
  add column if not exists facebook text,
  add column if not exists logo     text,       -- base64 ou URL
  add column if not exists photos   text[] default '{}';
