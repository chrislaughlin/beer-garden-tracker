-- Auto-approve reviews by default and allow anon inserts of approved reviews

-- Make approved the default for new reviews
alter table public.reviews
  alter column status set default 'approved';

-- One-time backfill of any pending reviews
update public.reviews
set status = 'approved'
where status = 'pending';

-- Replace the anon insert policy to allow approved submissions
drop policy if exists "reviews_insert_anon_pending" on public.reviews;
drop policy if exists "reviews_insert_anon_approved" on public.reviews;
drop policy if exists "reviews_insert_anon_autoapproved" on public.reviews;
create policy "reviews_insert_anon_autoapproved"
on public.reviews
for insert
to anon
with check (
  user_id is null
  and status = 'approved'
  and exists (
    select 1
    from public.beer_gardens bg
    where bg.id = reviews.beer_garden_id
      and bg.status = 'approved'
  )
);
