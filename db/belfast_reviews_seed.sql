-- Seed reviews for Belfast beer gardens with deterministic fallback ratings.
-- Run after db/schema.sql and db/belfast_beer_gardens_import.sql

with raw_reviews(slug, review_id, review_text, rating_text, source, approx_date) as (
  values
    ('dirty-onion-yardbird', 1, 'What a great place to eat. Great... Dirty onion and yardbird.', 'N/A', 'TripAdvisor', 'Nov 2019 (still referenced positively)'),
    ('dirty-onion-yardbird', 2, 'Best pub food in Belfast. Best roast in Belfast. Best Sunday carvery in Belfast.', 'N/A', 'Reddit', 'Recent'),
    ('dirty-onion-yardbird', 3, 'One of Belfast''s biggest beer gardens with heated area and live music.', 'N/A', 'TripAdvisor', 'Recent'),
    ('dirty-onion-yardbird', 4, 'Great atmosphere in the beer garden.', '4.5/5', 'TripAdvisor overall', '2025-2026'),

    ('thirsty-goat', 1, 'Amazing beer garden with live music all night... amazing atmosphere.', 'N/A', 'TripAdvisor', 'Nov 2023'),
    ('thirsty-goat', 2, 'We were seated in the outside beer garden... great live music.', 'N/A', 'TripAdvisor', 'Recent'),
    ('thirsty-goat', 3, 'Quirky bar whose beer garden attracts both locals and tourists. Staff 10/10.', 'N/A', 'TripAdvisor', 'Recent'),
    ('thirsty-goat', 4, 'Vibrant atmosphere, live music, friendly staff.', 'N/A', 'General review summary', '2026'),

    ('second-fiddle', 1, 'Another great visit.', '5/5', 'TripAdvisor', 'Recent'),
    ('second-fiddle', 2, 'Great pub... excellent Irish music and culture vibe.', '5/5', 'TripAdvisor', 'Recent'),
    ('second-fiddle', 3, 'Contemporary Irish music venue with beer garden.', 'N/A', 'VisitBelfast', 'Recent'),

    ('duke-of-york', 1, 'Superb pub... well worth going to if you''re in Belfast.', '4.5/5', 'TripAdvisor', 'Jan 2025'),
    ('duke-of-york', 2, 'Classic pub with ornate interior and great outdoor alleyway area.', '4.5/5', 'TripAdvisor', 'Recent'),
    ('duke-of-york', 3, 'Great bar for younger crowd... friendly staff and drinks.', 'N/A', 'BelfastBar.co.uk', '2024-2025'),

    ('the-national', 1, 'Great welcome... large beer garden with tables and outdoor bar.', '3.8/5', 'TripAdvisor', 'Recent'),
    ('the-national', 2, 'Refreshing... garden was lovely to sit in and enjoy our food.', 'N/A', 'Wanderlog', 'Recent'),
    ('the-national', 3, 'Largest beer garden in the city... popular for social gatherings.', 'N/A', 'General review', '2026'),

    ('the-bone-yard', 1, 'Vibrant and colorful outdoor venue... fantastic vibes, great music.', '4.0/5', 'Wanderlog/Google', 'Recent'),
    ('the-bone-yard', 2, 'Dog-friendly... expansive beer garden. Catherine was great service.', 'N/A', 'TripAdvisor', 'Recent'),
    ('the-bone-yard', 3, 'Eccentric outdoor venue with bench tables and events.', 'N/A', 'General', 'Recent'),

    ('cafe-parisien', 1, 'Fabulous high table with stunning views... exceeded expectations.', 'N/A', 'TripAdvisor', 'Recent'),
    ('cafe-parisien', 2, 'All-weather terrace and balcony overlooking City Hall... delightful.', '4.1/5', 'TripAdvisor', 'Recent'),
    ('cafe-parisien', 3, 'Friendly staff... perfect location.', 'N/A', 'Review blogs', '2017-2026 (still positive)'),

    ('filthy-mcnastys', 1, 'Secret terrace and alleyway beer garden... electric atmosphere with live music.', 'N/A', 'Pastiebap/Skiddle', 'Recent'),
    ('filthy-mcnastys', 2, 'Biggest star is the beer garden... amazing outdoor space with heaters.', 'N/A', 'Yelp', 'Recent'),
    ('filthy-mcnastys', 3, 'Quirky and cool... top night in the alleyway beer garden.', 'N/A', 'General', 'Recent'),

    ('the-perch', 1, 'Great cocktails... rooftop bar with urban garden.', '3.3/5', 'TripAdvisor', 'Recent'),
    ('the-perch', 2, 'Lovely bar... kicked back and took in the great bar while sipping beers.', 'N/A', 'TripAdvisor', 'Recent'),
    ('the-perch', 3, 'Urban garden and cocktails in an airy high-level space.', 'N/A', 'General', 'Recent'),

    ('limelight-rock-garden', 1, 'Rooftop area perfect for enjoying beers and sunsets.', 'N/A', 'Original listing + recent mentions', 'Recent'),
    ('limelight-rock-garden', 2, 'Upper outdoor terrace... ace people watching.', 'N/A', 'Pastiebap', 'Recent'),

    ('the-jailhouse', 1, 'Cosy outdoor seating area... relaxing.', '3.6/5', 'TripAdvisor', 'Recent'),
    ('the-jailhouse', 2, 'Historic pub with timeless character and lively social scene.', 'N/A', 'General', 'Recent'),

    ('kellys-cellars', 1, 'Sheltered beer garden popular with locals... step back in time.', 'N/A', 'Reddit/TripAdvisor', 'Recent'),
    ('kellys-cellars', 2, 'Great atmosphere and live music on many nights.', 'N/A', 'BelfastBar.co.uk', '2024'),

    ('whites-tavern', 1, 'Fantastic location... large beer garden. Superb old world pub.', '3.9/5', 'TripAdvisor', 'Recent'),
    ('whites-tavern', 2, 'Pizzas and pints in a cosy open-plan garden... must visit.', 'N/A', 'TripAdvisor', 'Recent'),

    ('mchughs-bar', 1, 'Sunny outdoor area... pints and live music. Oldest building in Belfast.', 'N/A', 'TripAdvisor/Facebook', 'Recent'),
    ('mchughs-bar', 2, 'Great craic and friendly staff.', 'N/A', 'General reviews', 'Recent'),

    ('botanic-inn', 1, 'Beer garden with huts and screens... popular with sports fans.', 'N/A', 'TripAdvisor/Yelp', 'Recent'),
    ('botanic-inn', 2, 'Super in the summer in the beer garden. Good food.', 'N/A', 'Yelp', 'Recent'),

    ('parlour-bar', 1, 'Well poured pints of Guinness in the beer garden... polite service.', 'N/A', 'TripAdvisor', 'Recent'),
    ('parlour-bar', 2, 'Large beer garden at the back... student-friendly.', '4.4/5', 'Sluurpy/Instagram', 'Recent'),

    ('cutters-wharf', 1, 'Riverside beer garden... chill out by the river.', '3.3/5', 'TripAdvisor', 'Recent'),
    ('cutters-wharf', 2, 'Fantastic location and trendy... attentive service.', '4.2/5', 'Wanderlog/Google', 'Recent'),

    ('laverlys-bar', 1, 'Modern beer garden with TVs and entertainment.', 'N/A', 'General', 'Recent'),
    ('laverlys-bar', 2, 'Street-level beer garden... great for music lovers.', 'N/A', 'DiscoverNI', 'Recent'),

    ('cargo', 1, 'Festival-style beer garden with fire pits and private booths.', 'N/A', 'CityToursBelfast', 'Recent'),
    ('cargo', 2, 'Largest outdoor licensed spot... lively atmosphere.', '3.6/5', 'TripAdvisor', 'Recent'),

    ('devenish-bar', 1, 'Lively beer garden with cinema screen for sports.', 'N/A', 'CityToursBelfast', 'Recent'),
    ('devenish-bar', 2, 'Welcoming lively beer garden... great for events.', 'N/A', 'General', 'Recent'),

    ('horatio-todds', 1, 'Beer garden overlooks Ballyhackamore... beautiful surroundings.', 'N/A', 'TripAdvisor', 'Recent'),
    ('horatio-todds', 2, 'Amazing food, staff and beautiful surroundings.', 'N/A', 'TripAdvisor', 'Recent'),

    ('sunflower-public-house', 1, 'Beer garden Narnia... wood-fired pizza oven, dog-friendly.', 'N/A', 'TripAdvisor', 'Recent'),
    ('sunflower-public-house', 2, 'Lovely big beer garden... live music, good choices of beers.', '4/5', 'TripAdvisor', 'Recent'),

    ('hudson-bar', 1, 'Great sun trap beer garden... large beer garden off Royal Avenue.', 'N/A', 'TripAdvisor', 'Recent'),
    ('hudson-bar', 2, 'Bustling... eclectic decor and craft beer.', 'N/A', 'Wanderlog', 'Recent'),

    ('the-spaniard', 1, 'Cosy beer garden in the heart of Belfast... one of the best bars.', '4.0/5', 'TripAdvisor', 'Recent'),
    ('the-spaniard', 2, 'Intentional random style... great poky wee place.', 'N/A', 'Reddit/BelfastBar', 'Recent'),

    ('garrick-bar', 1, 'Outside drinking space... great craic, trad music.', 'N/A', 'TripAdvisor/BelfastBar', 'Recent'),
    ('garrick-bar', 2, 'Probably the best pint in Belfast.', 'N/A', 'Facebook', 'Recent'),

    ('cloth-ear', 1, 'Beer garden attached to Merchant Hotel... stylish decor and vibrant ambiance.', '3.8/5', 'TripAdvisor', 'Recent'),
    ('cloth-ear', 2, 'Fantastic look and feel... excellent seating options.', '4.3/5', 'TripAdvisor', 'Recent'),

    ('crown-liquor-saloon', 1, 'Outdoor area for drinks in the sunshine... historic Victorian decor.', '4.1/5', 'TripAdvisor', 'Recent'),
    ('crown-liquor-saloon', 2, 'Lively atmosphere... ornate and charming.', 'N/A', 'General', 'Recent'),

    ('errigle-inn', 1, 'Popular beer garden along Ormeau Road... brilliant local pub.', 'N/A', 'Yelp/TripAdvisor', 'Recent'),
    ('errigle-inn', 2, 'Staff amazing... great beer garden.', 'N/A', 'Reddit', 'Recent'),

    ('american-bar', 1, 'Relaxed beer garden... food is amazing.', 'N/A', 'TripAdvisor', 'May 2022'),
    ('american-bar', 2, 'Dog-friendly... great pints and traditional bar.', 'N/A', 'Facebook/BestBark', 'Recent'),

    ('harp-bar', 1, 'Outdoor drinking area perfect for a pint... raucous and rousing.', 'N/A', 'TripAdvisor/Facebook', 'Recent'),

    ('kitchen-bar', 1, 'Outdoor beer garden... great pint and good atmosphere.', '3.5/5', 'TripAdvisor', 'Recent'),
    ('kitchen-bar', 2, 'Homely Irish vibe... welcoming.', 'N/A', 'General', 'Recent'),

    ('bullhouse-east', 1, 'Beer garden with wood-fired pizza oven... amazing craft beer.', '3.4/5', 'TripAdvisor', 'Recent'),
    ('bullhouse-east', 2, 'Incredible... staff exceptional.', '4.5/5', 'Wanderlog/Google', 'Recent'),

    ('love-and-death-inc', 1, 'Transforms Ann Street into a beer garden... quirky alternative vibe.', 'N/A', 'Review sites', 'Recent'),
    ('love-and-death-inc', 2, 'Great atmosphere and music venue.', 'N/A', 'Facebook/BelfastTelegraph', 'Recent'),

    ('the-doyen', 1, 'Outdoor seating wrapping around the building... beer garden feel.', '3.3/5', 'TripAdvisor', 'Recent'),
    ('the-doyen', 2, 'Beer garden looks lovely after renovation.', 'N/A', 'TripAdvisor', '2019-2026'),

    ('the-bowery', 1, 'Large outside terrace draped in foliage... attractive beer garden.', '2.9/5', 'TripAdvisor', 'Recent'),
    ('the-bowery', 2, 'Fantastic food... friendly staff and lively atmosphere.', 'N/A', 'OpenTable', 'Recent'),

    ('katys-bar', 1, 'Upper outdoor terrace perfect for summer drinks... friendly atmosphere.', 'N/A', 'TripAdvisor/Pastiebap', 'Recent'),
    ('katys-bar', 2, 'Great for gigs... bar staff chat away to you.', 'N/A', 'TripAdvisor', 'Recent')
),
normalized as (
  select
    slug,
    review_id,
    review_text,
    rating_text,
    source,
    approx_date,
    case
      when rating_text ~* '^[0-9]+(\\.[0-9]+)?/5' then
        greatest(1, least(5, round(split_part(rating_text, '/', 1)::numeric)::int))
      else
        3 + (abs(hashtextextended(slug || '|' || review_id::text, 0)) % 3)::int
    end as rating,
    case
      when approx_date ~* 'recent' then now() - interval '30 days'
      when approx_date ~* '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4}' then
        to_date(substring(approx_date from '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4}'), 'Mon YYYY')
      when approx_date ~ '^[0-9]{4}-[0-9]{4}' then
        to_date(substr(approx_date, 1, 4) || '-07-01', 'YYYY-MM-DD')
      when approx_date ~ '^[0-9]{4}$' then
        to_date(approx_date || '-06-15', 'YYYY-MM-DD')
      else
        now() - interval '45 days'
    end as created_at
  from raw_reviews
)
insert into reviews (beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at)
select bg.id, null, n.rating, n.review_text, null, 'approved', n.created_at
from normalized n
join beer_gardens bg on bg.slug = n.slug
where not exists (
  select 1
  from reviews r
  where r.beer_garden_id = bg.id
    and r.text = n.review_text
);
