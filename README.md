# Beer Garden Tracker

Beer Garden Tracker is a mobile-first MVP for discovering and contributing Belfast beer gardens. It is deliberately designed for sparse early data: instead of relying on a large pre-seeded venue list, the app makes anonymous venue submission a first-class flow and gives trusted admins lightweight moderation tools.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS with a warm, outdoorsy design system
- shadcn-style UI primitives
- Supabase-ready service layer for Auth, Storage, and Postgres/PostGIS
- TanStack Query provider scaffold
- Zod validation schemas
- MapLibre-ready layout hooks

## Product shape

### Public app
- `/` home dashboard with quick nearby discovery, filters, and add-venue CTA
- `/explore` sticky search + map/list-ready discovery view
- `/beer-garden/[slug]` rich venue detail page with photos, reviews, map slot, and sunset decision aid
- `/add` step-by-step mobile-first venue submission flow with duplicate warnings
- `/review/[beerGardenId]` lightweight anonymous review flow

### Admin
- `/admin` moderation overview
- `/admin/venues` venue list with status visibility model
- `/admin/venues/[id]` practical venue editing and duplicate-merge helper
- `/admin/reviews` review moderation queue
- `/admin/photos` photo moderation stub
- `/admin/reports` issue/change request view

## Data strategy

- Region is restricted to `belfast` for MVP.
- `db/seed.sql` provides a small starter dataset, but the app now reads from live Supabase tables.
- New venues are intended to be created through the app itself and currently publish as `approved` by default.
- Status model supports `pending`, `approved`, `flagged`, `rejected`, and `closed`.
- Trusted admin access should be enforced by allowlisted Supabase user IDs or an `admin_users` table.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add Supabase and Turnstile credentials. `NEXT_PUBLIC_MAPTILER_KEY` is optional; without it the app falls back to OpenStreetMap tiles.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run dev
   ```
5. Apply `db/schema.sql` to Supabase Postgres and optionally load `db/seed.sql`.

## Environment variables

See `.env.example` for:
- Supabase URL and anon key
- service role key
- optional MapTiler key
- Turnstile site/secret keys
- Open-Meteo base URL
- admin allowlist user IDs
- simple rate limit settings

## Architecture notes

### Services
- `beerGardenService`: nearby, detail, and admin venue retrieval
- `geocodingService`: reverse geocoding for add-flow address autofill
- `reviewService`: recent review moderation feed
- `photoService`: moderation feed for uploads
- `sunsetService`: simple countdown and consumer-friendly labels
- `duplicateDetectionService`: lightweight duplicate suggestions
- `adminModerationService`: metrics and change request aggregation

### Supabase expectations
- Anonymous auth for normal users
- Storage buckets for venue/review photos
- PostGIS geography column for radius and nearest-neighbour queries
- `pg_trgm` similarity for duplicate detection
- rate limiting by IP and anonymous user id at the API layer

### Anti-abuse hooks
- Turnstile before anonymous submit
- moderation statuses on venues, reviews, and photos
- duplicate detection before final venue submit
- trusted admin moderation cleanup for reports, spam, and bad imagery

## Assumptions

- Public reads and the basic add/review writes are wired to live Supabase now.
- Public write actions currently use trusted server-side inserts; anonymous-auth ownership still needs to be wired properly.
- Add-flow pins now reverse-geocode through MapTiler so the detected address is stored with the venue when possible.
- User-facing map panels now render through a shared MapLibre component, with OpenStreetMap tiles as the fallback when no MapTiler key is present.
- Sunset labels are intentionally simple in V1 and should later fetch real Open-Meteo sunset data server-side.
- Admin route restriction is enforced server-side against the current Supabase session and `admin_users`.

## Next steps

1. Replace service-role-backed public writes with anon-auth-owned writes that respect RLS directly.
2. Add Turnstile validation and rate limiting to the public submit flows.
3. Add bbox search, filtering, and clustering on top of the live MapLibre map.
4. Add photo upload flows to Supabase Storage.
5. Connect Open-Meteo sunset fetches and cache results per venue/day.
