alter table public.beer_gardens
  alter column region drop default,
  alter column region drop not null;

create or replace function public.nearby_beer_gardens(search_lat double precision, search_lng double precision, radius_m integer default 3000)
returns table (id uuid, name text, slug text, status venue_status, distance_m double precision)
language sql
as $$
  select bg.id, bg.name, bg.slug, bg.status, st_distance(bg.location, st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography) as distance_m
  from public.beer_gardens bg
  where st_dwithin(bg.location, st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography, radius_m)
  order by bg.location <-> st_setsrid(st_makepoint(search_lng, search_lat), 4326)::geography;
$$;

create or replace function public.detect_duplicate_beer_gardens(candidate_name text, candidate_lat double precision, candidate_lng double precision)
returns table (id uuid, name text, similarity_score real, distance_m double precision)
language sql
as $$
  select bg.id,
         bg.name,
         similarity(lower(bg.name), lower(candidate_name)) as similarity_score,
         st_distance(bg.location, st_setsrid(st_makepoint(candidate_lng, candidate_lat), 4326)::geography) as distance_m
  from public.beer_gardens bg
  where similarity(lower(bg.name), lower(candidate_name)) > 0.25
    and st_dwithin(bg.location, st_setsrid(st_makepoint(candidate_lng, candidate_lat), 4326)::geography, 250)
  order by similarity_score desc, distance_m asc;
$$;

drop policy if exists "beer_gardens_insert_authenticated" on public.beer_gardens;
create policy "beer_gardens_insert_authenticated"
on public.beer_gardens
for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
);

drop policy if exists "beer_gardens_update_admin_only" on public.beer_gardens;
create policy "beer_gardens_update_admin_only"
on public.beer_gardens
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
