import Link from 'next/link';
import { Star } from 'lucide-react';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { VenueCard } from '@/components/cards/venue-card';
import { MapPreviewCard } from '@/components/cards/map-preview-card';
import { EmptyStateBlock } from '@/components/cards/empty-state-block';
import { Button } from '@/components/ui/button';
import { buildExploreHref, VENUE_TAG_SUGGESTIONS } from '@/lib/discovery';

export default async function HomePage() {
  const venues = await beerGardenService.listNearby();
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Sunny-day decisions</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight">Find nearby beer gardens, check the light, and add the ones we’ve missed.</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/75">Built for quick dogfooding: geolocation-first, sparse-data friendly, and contribution-led from day one.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild><Link href="/explore">Explore nearby</Link></Button>
            <Button variant="ghost" asChild><Link href="/add">Know a good spot nearby?</Link></Button>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/80 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Quick filters</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ...VENUE_TAG_SUGGESTIONS.map((tag) => ({
                label: tag,
                href: buildExploreHref({ tags: [tag] }),
                showStar: false
              })),
              {
                label: '4+',
                href: buildExploreHref({ ratingMin: 4 }),
                showStar: true
              },
              {
                label: '1',
                href: buildExploreHref({ ratingMax: 1 }),
                showStar: true
              }
            ].map((filter) => (
              <Link
                key={filter.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
                href={filter.href}
              >
                {filter.showStar ? <Star className="h-4 w-4 fill-primary text-primary" /> : null}
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section>
        <MapPreviewCard venues={venues} />
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Nearby now</p><h2 className="text-2xl font-bold">Best bets for a pint outdoors</h2></div>
          <Button variant="outline" asChild><Link href="/explore">See all</Link></Button>
        </div>
        {venues.length ? <div className="grid gap-4 md:grid-cols-2">{venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}</div> : <EmptyStateBlock />}
      </section>
    </div>
  );
}
