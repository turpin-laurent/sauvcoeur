-- ============================================================
-- SauvCoeur.re — Table membres (utilisateurs inscrits)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

create table if not exists sc_users (
  id           text primary key,          -- email en minuscules
  email        text not null unique,
  name         text not null,
  password_enc text,                       -- mot de passe (stocké côté client aussi)
  newsletter   boolean default false,
  city         text,
  phone        text,
  avatar       text,
  created_at   timestamptz default now()
);

alter table sc_users enable row level security;

-- Lecture publique interdite (admin service role uniquement)
create policy "service role only" on sc_users
  for all using (false);
