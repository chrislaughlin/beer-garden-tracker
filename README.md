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
- `/api/beer-gardens`, `/api/reviews`, `/api/sunset`, and `/api/admin/metrics` JSON endpoints for the MVP service layer

## Data strategy

- Region is restricted to `belfast` for MVP.
- Only a tiny demo dataset is included.
- New venues are intended to be created through the app itself.
- Status model supports `pending`, `approved`, `flagged`, `rejected`, and `closed`.
- Trusted admin access is protected in-app with admin allowlisting and an `/admin` middleware gate that checks a trusted admin cookie; production wiring should mirror this to the authenticated Supabase session.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add Supabase, Turnstile, and map credentials.
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
- Turnstile site/secret keys
- Open-Meteo base URL
- admin allowlist user IDs
- simple rate limit settings

## Architecture notes

### Services
- `beerGardenService`: nearby, detail, and admin venue retrieval
- `reviewService`: recent review moderation feed
- `photoService`: moderation feed for uploads
- `sunsetService`: simple countdown and consumer-friendly labels
- `duplicateDetectionService`: lightweight duplicate suggestions
- `adminModerationService`: metrics and change request aggregation

### Routing and protection
- `/admin` paths are protected by `middleware.ts`, which checks a trusted admin cookie against `ADMIN_ALLOWLIST_USER_IDS`.
- `/unauthorized` provides a clear fallback for blocked admin access attempts.
- API routes return demo-backed JSON so the service layer is already consumable by a real frontend data client.

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

- This repo currently uses in-memory demo data to make the MVP runnable before wiring live Supabase queries.
- The visual map is represented by a polished placeholder panel, ready to swap for a live MapLibre component.
- Sunset labels are intentionally simple in V1 and should later fetch real Open-Meteo sunset data server-side.
- Admin route restriction is now enforced with middleware plus allowlisted IDs; production wiring should replace the cookie shortcut with a verified Supabase session-derived user id.

## Next steps

1. Replace demo services with real Supabase queries and mutations.
2. Add server actions or route handlers for Turnstile validation and rate limiting.
3. Swap in a live MapLibre map with pin placement and bbox search.
4. Add photo upload flows to Supabase Storage.
5. Connect Open-Meteo sunset fetches and cache results per venue/day.
