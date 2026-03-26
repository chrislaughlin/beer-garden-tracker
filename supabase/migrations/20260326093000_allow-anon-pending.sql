-- Allow anonymous inserts while keeping content moderated/pending and scoped by RLS

-- Beer gardens: allow anon to insert pending rows with no owner id
drop policy if exists "beer_gardens_insert_anon_pending" on public.beer_gardens;
create policy "beer_gardens_insert_anon_pending"
on public.beer_gardens
for insert
to anon
with check (
  status = 'pending'
  and created_by_user_id is null
);

-- Reviews: allow anon to insert pending reviews against approved venues
drop policy if exists "reviews_insert_anon_pending" on public.reviews;
create policy "reviews_insert_anon_pending"
on public.reviews
for insert
to anon
with check (
  user_id is null
  and status = 'pending'
  and exists (
    select 1
    from public.beer_gardens bg
    where bg.id = reviews.beer_garden_id
      and bg.status = 'approved'
  )
);

-- Ensure anon can read approved venues (select policy already exists, keep consistent)
-- No change for updates/deletes.
