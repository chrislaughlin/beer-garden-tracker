create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists pg_trgm;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'venue_status') then
    create type venue_status as enum ('pending', 'approved', 'flagged', 'rejected', 'closed');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'moderation_status') then
    create type moderation_status as enum ('pending', 'approved', 'flagged', 'rejected');
  end if;
end
$$;

create table if not exists admin_users (
  user_id uuid primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists beer_gardens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  location geography(point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored,
  address text,
  description text,
  region text,
  source text not null default 'user',
  has_evening_sun boolean,
  status venue_status not null default 'pending',
  confidence_score numeric(3,2) not null default 0.50,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists beer_gardens_location_idx on beer_gardens using gist (location);
create index if not exists beer_gardens_name_trgm_idx on beer_gardens using gin (name gin_trgm_ops);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  beer_garden_id uuid not null references beer_gardens(id) on delete cascade,
  user_id uuid,
  rating int not null check (rating between 1 and 5),
  text text not null,
  sunny_when_visited boolean,
  status moderation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  beer_garden_id uuid references beer_gardens(id) on delete cascade,
  review_id uuid references reviews(id) on delete cascade,
  storage_path text not null,
  uploaded_by_user_id uuid,
  moderation_status moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  check ((beer_garden_id is not null) or (review_id is not null))
);

create table if not exists change_requests (
  id uuid primary key default gen_random_uuid(),
  beer_garden_id uuid not null references beer_gardens(id) on delete cascade,
  type text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists venue_tags (
  id uuid primary key default gen_random_uuid(),
  beer_garden_id uuid not null references beer_gardens(id) on delete cascade,
  tag text not null
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action_type text not null,
  target_type text not null,
  target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function nearby_beer_gardens(search_lat double precision, search_lng double precision, radius_m integer default 3000)
returns table (id uuid, name text, slug text, status venue_status, distance_m double precision)
language sql
as $$
  select bg.id, bg.name, bg.slug, bg.status, st_distance(bg.location, st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography) as distance_m
  from beer_gardens bg
  where st_dwithin(bg.location, st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography, radius_m)
  order by bg.location <-> st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography;
$$;

create or replace function detect_duplicate_beer_gardens(candidate_name text, candidate_lat double precision, candidate_lng double precision)
returns table (id uuid, name text, similarity_score real, distance_m double precision)
language sql
as $$
  select bg.id,
         bg.name,
         similarity(lower(bg.name), lower(candidate_name)) as similarity_score,
         st_distance(bg.location, st_setsrid(st_makepoint(candidate_lng, candidate_lat), 4326)::geography) as distance_m
  from beer_gardens bg
  where similarity(lower(bg.name), lower(candidate_name)) > 0.25
    and st_dwithin(bg.location, st_setsrid(st_makepoint(candidate_lng, candidate_lat), 4326)::geography, 250)
  order by similarity_score desc, distance_m asc;
$$;
