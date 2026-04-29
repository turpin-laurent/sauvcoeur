-- ============================================================
-- SauvCoeur.re — Migration initiale
-- PostgreSQL 15 / Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";      -- géolocalisation précise

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role      as enum ('user', 'asso', 'pro', 'admin');
create type animal_status  as enum ('lost', 'found', 'to_adopt', 'adopted', 'deceased');
create type animal_gender  as enum ('male', 'female', 'unknown');
create type animal_species as enum ('dog', 'cat', 'bird', 'rabbit', 'other');
create type request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type pro_category   as enum ('vet', 'sitter', 'educator', 'groomer', 'rescue');

-- ============================================================
-- PROFILES (étend auth.users de Supabase)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  user_type       user_role not null default 'user',
  display_name    text not null,
  phone           text,
  city            text,
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Mise à jour automatique du timestamp
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- BREEDS (races — lookup table)
-- ============================================================
create table breeds (
  id      serial primary key,
  species animal_species not null,
  name    text not null,
  unique (species, name)
);

-- ============================================================
-- ANIMALS (cœur du système)
-- ============================================================
create table animals (
  id                uuid primary key default uuid_generate_v4(),
  author_id         uuid not null references profiles(id),
  status            animal_status not null default 'found',
  species           animal_species not null,
  gender            animal_gender not null default 'unknown',
  breed_id          integer references breeds(id),
  name              text,
  age_years         smallint check (age_years >= 0),
  specific_signs    text,                       -- signes distinctifs libres
  microchip_icad    char(15),                   -- validé en app (15 chiffres)
  color             text,
  photos            text[],                     -- URLs Supabase Storage

  -- Géolocalisation : colonne précise protégée par RLS
  location_precise  geometry(Point, 4326),      -- stocké mais jamais exposé brut
  location_city     text not null,              -- commune (public)

  -- Sécurité adoption
  found_at          date,
  published_at      timestamptz,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  rejection_reason  text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_animals_status   on animals(status);
create index idx_animals_city     on animals(location_city);
create index idx_animals_species  on animals(species);
create index idx_animals_location on animals using gist(location_precise);

create trigger trg_animals_updated_at
  before update on animals
  for each row execute function update_updated_at();

-- ============================================================
-- ADOPTION REQUESTS
-- ============================================================
create table adoption_requests (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id),
  animal_id           uuid not null references animals(id),
  status              request_status not null default 'pending',
  motivation          text,
  certificate_signed_at timestamptz,            -- horodatage signature engagement
  cool_off_ends_at    timestamptz               -- J+7 après signature
    generated always as (certificate_signed_at + interval '7 days') stored,
  finalized_at        timestamptz,
  created_at          timestamptz not null default now(),
  unique(user_id, animal_id)
);

create index idx_adoption_animal on adoption_requests(animal_id);
create index idx_adoption_user   on adoption_requests(user_id);

-- ============================================================
-- DIRECTORY PROS (annuaire professionnel)
-- ============================================================
create table directory_pros (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references profiles(id),
  category        pro_category not null,
  business_name   text not null,
  description     text,
  address         text,
  city            text not null,
  phone           text,
  website         text,
  is_verified     boolean not null default false,
  stripe_sub_id   text,                         -- ID abonnement Stripe
  stripe_status   text,                         -- active | past_due | canceled
  sort_boost      integer not null default 0,   -- vets = 100, pros = 10
  created_at      timestamptz not null default now()
);

create index idx_pros_city     on directory_pros(city);
create index idx_pros_category on directory_pros(category);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles : chaque user ne voit/modifie que le sien ; admin voit tout
alter table profiles enable row level security;
create policy "own profile" on profiles
  using (id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and user_type = 'admin'
  ));

-- Animals : localisation précise masquée pour les non-propriétaires
alter table animals enable row level security;

create policy "public can read approved animals (sans GPS)" on animals
  for select using (moderation_status = 'approved');

-- Vue publique : exclut location_precise (jamais dans le select)
create view public_animals as
  select
    id, status, species, gender, breed_id, name, age_years,
    specific_signs, color, photos,
    -- Floutage : centroïde de la commune seulement
    location_city,
    moderation_status, published_at, created_at
  from animals
  where moderation_status = 'approved';

-- Adoption requests : visible par l'auteur et l'admin
alter table adoption_requests enable row level security;
create policy "own requests" on adoption_requests
  using (user_id = auth.uid() or exists (
    select 1 from profiles where id = auth.uid() and user_type = 'admin'
  ));

-- ============================================================
-- FONCTION : checkAdoptionEligibility
-- Retourne true si la transaction peut être finalisée
-- ============================================================
create or replace function check_adoption_eligibility(p_animal_id uuid)
returns jsonb
language plpgsql security definer as $$
declare
  v_req adoption_requests%rowtype;
  v_animal animals%rowtype;
begin
  select * into v_req
  from adoption_requests
  where animal_id = p_animal_id
    and status = 'approved'
    and finalized_at is null
  order by created_at desc limit 1;

  if not found then
    return jsonb_build_object('eligible', false, 'reason', 'no_approved_request');
  end if;

  if v_req.certificate_signed_at is null then
    return jsonb_build_object('eligible', false, 'reason', 'certificate_not_signed');
  end if;

  if now() < v_req.cool_off_ends_at then
    return jsonb_build_object(
      'eligible', false,
      'reason', 'cool_off_period',
      'cool_off_ends_at', v_req.cool_off_ends_at
    );
  end if;

  select * into v_animal from animals where id = p_animal_id;
  if v_animal.status = 'adopted' then
    return jsonb_build_object('eligible', false, 'reason', 'already_adopted');
  end if;

  return jsonb_build_object('eligible', true, 'request_id', v_req.id);
end;
$$;

-- ============================================================
-- SEED : communes de La Réunion (974)
-- ============================================================
insert into breeds (species, name) values
  ('dog', 'Berger Réunionnais'), ('dog', 'Chien courant'), ('dog', 'Sans race définie'),
  ('cat', 'Européen'), ('cat', 'Sans race définie');
