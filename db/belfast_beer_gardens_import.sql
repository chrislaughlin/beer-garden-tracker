-- Import of Belfast beer gardens sourced from belfast_beer_gardens.csv (2026-03-26)
-- Non-boolean "sun" values default to true per request.

with incoming(slug, name, lat, lng, address, description, region, source, raw_has_evening_sun) as (
  values
    ('dirty-onion-yardbird','Dirty Onion & Yardbird',54.60158,-5.92631,'3 Hill Street, Belfast BT1 2LA','The Dirty Onion has one of Belfasts biggest beer gardens with a heated area and covered space for live music.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=The%20Dirty%20Onion%20is%20one','true'),
    ('thirsty-goat','Thirsty Goat',54.60135,-5.92641,'1 Hill Street, Belfast BT1 2LA','The Thirsty Goat is a quirky bar whose beer garden attracts both locals and tourists.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Located%20on%20the%20corner%20of','true'),
    ('second-fiddle','Second Fiddle',54.60142,-5.92585,'Cotton Court, 30-42 Waring St, Belfast BT1 2ED','The Second Fiddle hosts events and serves meals and beers outdoors in its beer garden.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Situated%20on%20Waring%20Street%2C%20The','false'),
    ('duke-of-york','Duke of York',54.60178,-5.92732,'Commercial Court, Belfast BT1 2NB','The Duke of York features an outdoor drinking area on the cobbled alleyway decorated with umbrellas.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('the-national','The National',54.60041,-5.92592,'62 High Street, Belfast BT1 2BE','The National boasts a large beer garden with tables and an outdoor bar.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=The%20National%20provides%20an%20atmosphere','true'),
    ('the-bone-yard','The Bone Yard',54.59326,-5.93158,'29-33 Bedford Street, Belfast BT2 7EJ','The Bone Yard is an eccentric outdoor venue with bench tables and a selection of drinks and events.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('cafe-parisien','Cafe Parisien',54.59744,-5.92972,'Unit 5 Cleaver House, Donegall Square North, Belfast BT1 5GA','Caf Parisien has an allweather terrace and balcony overlooking Belfasts City Hall.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Caf%C3%A9%20Parisien%20in%20the%20centre','true'),
    ('filthy-mcnastys','Filthy McNastys',54.593,-5.931,'45 Dublin Road, Belfast BT2 7HD','Filthy McNastys has a secret terrace and alleyway beer garden where patrons enjoy craft cans and live music.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Despite%20its%20name%2C%20Filthy%20McNastys','true'),
    ('the-perch','The Perch Rooftop Bar',54.59769,-5.93,'42 Franklin Street, Belfast BT2 7DS','The Perch is a rooftop bar with an urban garden and cocktails in an airy highlevel space.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('limelight-rock-garden','Limelight (Rock Garden)',54.59285,-5.92868,'17 Ormeau Avenue, Belfast BT2 8HD','The Limelights Rock Garden rooftop area is perfect for enjoying beers and sunsets.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('the-jailhouse','The Jailhouse',54.60149,-5.92722,'15-17 Joy''s Entry, Belfast BT1 4DR','The Jailhouse has a cosy outdoor seating area where patrons can relax.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=For%20more%20than%20a%20century%2C','false'),
    ('kellys-cellars','Kelly''s Cellars',54.599918,-5.933222,'30-32 Bank Street, Belfast BT1 1HL','Kellys Cellars features a sheltered beer garden popular with locals.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','false'),
    ('whites-tavern','White''s Tavern & Garden',54.601293,-5.926262,'2-4 Winecellar Entry, Belfast BT1 1QN','Whites Taverns Garden offers pizzas and pints in a cosy openplan garden.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Whites%20Tavern%20%26%20Garden%20offers','true'),
    ('mchughs-bar','McHugh''s Bar',54.602791,-5.926938,'29-31 Queen''s Square, Belfast BT1 3FG','McHughs Bar has a sunny outdoor area where you can enjoy pints and live music.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=One%20will%20come%20across%20McHugh%27s','true'),
    ('botanic-inn','Botanic Inn',54.58102,-5.93861,'23-27 Malone Road, Belfast BT9 6RU','The Botanic Inns beer garden has huts and screens, making it popular with sports fans.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('parlour-bar','Parlour Bar',54.58423,-5.93797,'2-8 Elmwood Avenue, Belfast BT9 6AY','The Parlour Bar is a studentfriendly spot with a beer garden offering pizzas and pint deals.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','false'),
    ('cutters-wharf','Cutters Wharf',54.57238,-5.92928,'5 Lockview Road, Belfast BT9 5FJ','Cutters Wharf features a riverside beer garden with heaters and retractable awnings along the River Lagan.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('laverlys-bar','Lavery''s Bar',54.58902,-5.93438,'12-14 Bradbury Place, Belfast BT7 1RS','Laverys has a modern beer garden with TVs and various entertainment.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('cargo','Cargo',54.5965,-5.92,'2 Queens Road, Belfast BT3 9DT','Cargos festivalstyle beer garden includes fire pits and private booths.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('devenish-bar','Devenish Bar',54.56452,-5.98673,'37-47 Finaghy Road North, Belfast BT10 0JB','The Devenish Bars lively beer garden features a cinema screen for sports events.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=','true'),
    ('horatio-todds','Horatio Todd''s',54.59526,-5.86522,'406 Upper Newtownards Road, Belfast BT4 3EZ','Horatio Todds beer garden overlooks Ballyhackamore and offers views toward Stormont.','Belfast, Northern Ireland','https://citytoursbelfast.com/beer-gardens-belfast#:~:text=Horatio%20Todd%27s%20is%20located%20in','true'),
    ('sunflower-public-house','Sunflower Public House',54.60251,-5.92861,'65 Union Street, Belfast BT1 2JG','Described as a beer garden Narnia, the Sunflower Public House has a woodfired pizza oven and dogfriendly vibe.','Belfast, Northern Ireland','https://pastiebap.com/food-and-drink/review-5-great-belfast-city-centre-beer-gardens/#:~:text=Through%20that%20cage%2C%20past%20the','true'),
    ('hudson-bar','Hudson Bar',54.60179,-5.93219,'10-14 Gresham Street, Belfast BT1 1JN','The Hudson Bar features a large beer garden off Royal Avenue.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','true'),
    ('the-spaniard','The Spaniard',54.60187,-5.92987,'3 Skipper Street, Belfast BT1 2DZ','The Spaniard offers a cosy beer garden in the heart of Belfast.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','false'),
    ('garrick-bar','Garrick Bar',54.6012,-5.9297,'29 Chichester Street, Belfast BT1 4JB','The Garrick Bar has an outside drinking space popular with locals.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','false'),
    ('cloth-ear','Cloth Ear',54.60243,-5.92481,'33-34 Waring Street, Belfast BT1 2DX','The Cloth Ears beer garden is attached to the Merchant Hotel.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','false'),
    ('crown-liquor-saloon','Crown Liquor Saloon',54.59725,-5.93079,'46 Great Victoria Street, Belfast BT2 7BA','The Crown Liquor Saloon has an outdoor area where you can enjoy drinks in the sunshine.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','true'),
    ('errigle-inn','Errigle Inn',54.5854,-5.9301,'312-320 Ormeau Road, Belfast BT7 2GE','The Errigle Inn features a popular beer garden along Ormeau Road.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','true'),
    ('american-bar','American Bar',54.60668,-5.91593,'65 Dock Street, Belfast BT15 1LF','The American Bar in Sailortown has a relaxed beer garden.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','true'),
    ('harp-bar','Harp Bar',54.60239,-5.92646,'35 Hill Street, Belfast BT1 2LB','The Harp Bars outdoor drinking area is perfect for enjoying a pint.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','true'),
    ('kitchen-bar','Kitchen Bar',54.6008,-5.922,'1 Victoria Square, Belfast BT1 4QG','The Kitchen Bar at Victoria Square offers an outdoor beer garden where patrons can relax.','Belfast, Northern Ireland','https://www.thenorthernpulse.com/raise-a-glass-the-best-beer-gardens-in-belfast/','false'),
    ('bullhouse-east','Bullhouse East',54.60377,-5.89122,'442 Newtownards Road, Belfast BT4 1HJ','Bullhouse East is Belfasts first permanent taproom; its beer garden with a woodfired pizza oven opens onto CS Lewis Square.','Belfast, Northern Ireland','https://www.visiteastside.com/listing/bullhouse-east#:~:text=Bullhouse%20East%20is%20Belfast%27s%20first','true'),
    ('love-and-death-inc','Love & Death Inc',54.599,-5.92715,'27-31 Ann Street, Belfast BT1 4EB','Love & Death transforms Ann Street into a beer garden with heaters and improved seating.','Belfast, Northern Ireland','https://www.centralbelfastapartments.com/pints-no-longer-a-pipe-dream-welcome-back-to-outdoor-hospitality/#:~:text=Love%20%26%20Death','true'),
    ('the-doyen','The Doyen',54.56822,-5.96891,'829 Lisburn Road, Belfast BT9 7GY','The Doyen has outdoor seating wrapping around the building, offering a beer garden feel.','Belfast, Northern Ireland','https://www.centralbelfastapartments.com/pints-no-longer-a-pipe-dream-welcome-back-to-outdoor-hospitality/#:~:text=A%20Bit%20Out%20Of%20The','true'),
    ('the-bowery','The Bowery',54.57245,-5.96033,'701 Lisburn Road, Belfast BT9 7GU','The Bowerys large outside terrace draped in foliage makes it an attractive beer garden.','Belfast, Northern Ireland','https://www.centralbelfastapartments.com/pints-no-longer-a-pipe-dream-welcome-back-to-outdoor-hospitality/#:~:text=The%20Bowery','true'),
    ('katys-bar','Katy''s Bar',54.59285,-5.92868,'17 Ormeau Avenue, Belfast BT2 8HD','Katys Bar in the Limelight complex has an upper outdoor terrace perfect for summer drinks.','Belfast, Northern Ireland','https://pastiebap.com/food-and-drink/review-5-great-belfast-city-centre-beer-gardens/#:~:text=Whilst%20the%20upper%20outdoor%20smoking','true')
),
normalized as (
  select
    slug,
    name,
    lat::double precision as lat,
    lng::double precision as lng,
    address,
    description,
    region,
    source,
    case
      when lower(raw_has_evening_sun) in ('true', 'false') then lower(raw_has_evening_sun)::boolean
      else true
    end as has_evening_sun
  from incoming
)
insert into beer_gardens (slug, name, lat, lng, address, description, region, source, has_evening_sun, status, confidence_score)
select slug, name, lat, lng, address, description, region, source, has_evening_sun, 'approved', 0.72
from normalized
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
