create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_beer_gardens_updated_at on public.beer_gardens;
create trigger set_beer_gardens_updated_at
before update on public.beer_gardens
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.beer_gardens enable row level security;
alter table public.reviews enable row level security;
alter table public.photos enable row level security;
alter table public.change_requests enable row level security;
alter table public.venue_tags enable row level security;
alter table public.admin_actions enable row level security;

drop policy if exists "admin_users_self_or_admin_select" on public.admin_users;
create policy "admin_users_self_or_admin_select"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "beer_gardens_select_public_owner_admin" on public.beer_gardens;
create policy "beer_gardens_select_public_owner_admin"
on public.beer_gardens
for select
to anon, authenticated
using (
  status = 'approved'
  or created_by_user_id = auth.uid()
  or public.is_admin()
);

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

drop policy if exists "beer_gardens_delete_admin_only" on public.beer_gardens;
create policy "beer_gardens_delete_admin_only"
on public.beer_gardens
for delete
to authenticated
using (public.is_admin());

drop policy if exists "reviews_select_public_owner_admin" on public.reviews;
create policy "reviews_select_public_owner_admin"
on public.reviews
for select
to anon, authenticated
using (
  status = 'approved'
  or user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "reviews_insert_authenticated" on public.reviews;
create policy "reviews_insert_authenticated"
on public.reviews
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.beer_gardens bg
    where bg.id = reviews.beer_garden_id
      and (
        bg.status = 'approved'
        or bg.created_by_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists "reviews_update_admin_only" on public.reviews;
create policy "reviews_update_admin_only"
on public.reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reviews_delete_admin_only" on public.reviews;
create policy "reviews_delete_admin_only"
on public.reviews
for delete
to authenticated
using (public.is_admin());

drop policy if exists "photos_select_public_owner_admin" on public.photos;
create policy "photos_select_public_owner_admin"
on public.photos
for select
to anon, authenticated
using (
  moderation_status = 'approved'
  or uploaded_by_user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "photos_insert_authenticated" on public.photos;
create policy "photos_insert_authenticated"
on public.photos
for insert
to authenticated
with check (
  uploaded_by_user_id = auth.uid()
  and (
    (
      beer_garden_id is not null
      and exists (
        select 1
        from public.beer_gardens bg
        where bg.id = photos.beer_garden_id
          and (
            bg.status = 'approved'
            or bg.created_by_user_id = auth.uid()
            or public.is_admin()
          )
      )
    )
    or (
      review_id is not null
      and exists (
        select 1
        from public.reviews r
        where r.id = photos.review_id
          and (
            r.status = 'approved'
            or r.user_id = auth.uid()
            or public.is_admin()
          )
      )
    )
  )
);

drop policy if exists "photos_update_admin_only" on public.photos;
create policy "photos_update_admin_only"
on public.photos
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "photos_delete_admin_only" on public.photos;
create policy "photos_delete_admin_only"
on public.photos
for delete
to authenticated
using (public.is_admin());

drop policy if exists "change_requests_insert_authenticated" on public.change_requests;
create policy "change_requests_insert_authenticated"
on public.change_requests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.beer_gardens bg
    where bg.id = change_requests.beer_garden_id
      and (
        bg.status = 'approved'
        or bg.created_by_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists "change_requests_admin_select" on public.change_requests;
create policy "change_requests_admin_select"
on public.change_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "change_requests_admin_update" on public.change_requests;
create policy "change_requests_admin_update"
on public.change_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "change_requests_admin_delete" on public.change_requests;
create policy "change_requests_admin_delete"
on public.change_requests
for delete
to authenticated
using (public.is_admin());

drop policy if exists "venue_tags_select_public_owner_admin" on public.venue_tags;
create policy "venue_tags_select_public_owner_admin"
on public.venue_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.beer_gardens bg
    where bg.id = venue_tags.beer_garden_id
      and (
        bg.status = 'approved'
        or bg.created_by_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists "venue_tags_insert_owner_admin" on public.venue_tags;
create policy "venue_tags_insert_owner_admin"
on public.venue_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.beer_gardens bg
    where bg.id = venue_tags.beer_garden_id
      and (
        bg.created_by_user_id = auth.uid()
        or public.is_admin()
      )
  )
);

drop policy if exists "venue_tags_update_admin_only" on public.venue_tags;
create policy "venue_tags_update_admin_only"
on public.venue_tags
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "venue_tags_delete_admin_only" on public.venue_tags;
create policy "venue_tags_delete_admin_only"
on public.venue_tags
for delete
to authenticated
using (public.is_admin());

drop policy if exists "admin_actions_admin_select" on public.admin_actions;
create policy "admin_actions_admin_select"
on public.admin_actions
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_actions_admin_insert" on public.admin_actions;
create policy "admin_actions_admin_insert"
on public.admin_actions
for insert
to authenticated
with check (public.is_admin() and admin_user_id = auth.uid());

drop policy if exists "admin_actions_admin_update" on public.admin_actions;
create policy "admin_actions_admin_update"
on public.admin_actions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_actions_admin_delete" on public.admin_actions;
create policy "admin_actions_admin_delete"
on public.admin_actions
for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_bucket_owner_or_approved_read" on storage.objects;
create policy "photos_bucket_owner_or_approved_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'photos'
  and (
    owner_id = auth.uid()::text
    or public.is_admin()
    or exists (
      select 1
      from public.photos p
      where p.storage_path = name
        and p.moderation_status = 'approved'
    )
  )
);

drop policy if exists "photos_bucket_authenticated_uploads" on storage.objects;
create policy "photos_bucket_authenticated_uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "photos_bucket_owner_or_admin_update" on storage.objects;
create policy "photos_bucket_owner_or_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'photos'
  and (
    owner_id = auth.uid()::text
    or public.is_admin()
  )
)
with check (
  bucket_id = 'photos'
  and (
    owner_id = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "photos_bucket_owner_or_admin_delete" on storage.objects;
create policy "photos_bucket_owner_or_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photos'
  and (
    owner_id = auth.uid()::text
    or public.is_admin()
  )
);
