insert into beer_gardens (slug, name, lat, lng, address, description, region, source, has_evening_sun, status, confidence_score)
values
  ('sunset-yard-cathedral-quarter', 'Sunset Yard', 54.6012, -5.9257, 'Cathedral Quarter, Belfast', 'Cosy courtyard tables, string lights, and a reliable late glow when the weather behaves.', 'belfast', 'seed', true, 'approved', 0.94),
  ('harbour-hops-titanic-quarter', 'Harbour Hops', 54.6074, -5.9042, 'Titanic Quarter, Belfast', 'Open deck near the water with broad tables and a breezy feel.', 'belfast', 'seed', false, 'approved', 0.88),
  ('botanic-terrace-house', 'Botanic Terrace House', 54.5839, -5.9345, 'Botanic Avenue, Belfast', 'Leafy back terrace hidden just off the main stretch, ideal for a quieter catch-up.', 'belfast', 'user', true, 'pending', 0.71)
on conflict (slug) do update
set name = excluded.name,
    lat = excluded.lat,
    lng = excluded.lng,
    address = excluded.address,
    description = excluded.description,
    region = excluded.region,
    source = excluded.source,
    has_evening_sun = excluded.has_evening_sun,
    status = excluded.status,
    confidence_score = excluded.confidence_score;

insert into venue_tags (beer_garden_id, tag)
select bg.id, seed.tag
from (
  values
    ('sunset-yard-cathedral-quarter', 'Sunny spot'),
    ('sunset-yard-cathedral-quarter', 'Good atmosphere'),
    ('sunset-yard-cathedral-quarter', 'Covered seating'),
    ('harbour-hops-titanic-quarter', 'Food available'),
    ('harbour-hops-titanic-quarter', 'Busy'),
    ('botanic-terrace-house', 'Quiet'),
    ('botanic-terrace-house', 'Dog friendly')
) as seed(slug, tag)
join beer_gardens bg on bg.slug = seed.slug
where not exists (
  select 1
  from venue_tags existing
  where existing.beer_garden_id = bg.id
    and existing.tag = seed.tag
);

insert into reviews (beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at)
select bg.id, seed.user_id::uuid, seed.rating, seed.text, seed.sunny_when_visited, seed.status::moderation_status, seed.created_at::timestamptz
from (
  values
    ('sunset-yard-cathedral-quarter', null, 5, 'Great golden-hour pint spot with plenty of room even after work.', true, 'approved', '2026-03-22T18:10:00Z'),
    ('sunset-yard-cathedral-quarter', null, 4, 'Cosy and reliable, especially if you get there before the rush.', true, 'approved', '2026-03-21T17:05:00Z'),
    ('harbour-hops-titanic-quarter', null, 4, 'Big open deck and good atmosphere, but it gets windy.', false, 'approved', '2026-03-22T16:25:00Z'),
    ('botanic-terrace-house', null, 4, 'Quiet little terrace tucked away from the main road.', true, 'pending', '2026-03-22T13:30:00Z')
) as seed(slug, user_id, rating, text, sunny_when_visited, status, created_at)
join beer_gardens bg on bg.slug = seed.slug
where not exists (
  select 1
  from reviews existing
  where existing.beer_garden_id = bg.id
    and existing.text = seed.text
);

insert into change_requests (beer_garden_id, type, reason, created_at)
select bg.id, seed.type, seed.reason, seed.created_at::timestamptz
from (
  values
    ('botanic-terrace-house', 'edit', 'Pin is a touch off — seating is in the lane behind the pub.', '2026-03-23T12:05:00Z'),
    ('harbour-hops-titanic-quarter', 'duplicate', 'Looks like the same venue as Harbour Hop Belfast on Google.', '2026-03-23T15:40:00Z')
) as seed(slug, type, reason, created_at)
join beer_gardens bg on bg.slug = seed.slug
where not exists (
  select 1
  from change_requests existing
  where existing.beer_garden_id = bg.id
    and existing.reason = seed.reason
);
