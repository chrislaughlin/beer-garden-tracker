import { LocateFixed } from 'lucide-react';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { EmptyStateBlock } from '@/components/cards/empty-state-block';
import { VenueCard } from '@/components/cards/venue-card';
import { ExploreFilters } from '@/components/explore/explore-filters';
import { parseExploreSearchParams, type ExploreSearchParams } from '@/lib/discovery';

export default async function ExplorePage({
  searchParams
}: {
  searchParams?: Promise<ExploreSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filters = parseExploreSearchParams(resolvedSearchParams);
  const venues = await beerGardenService.listNearby(filters);

  return (
    <div className="space-y-5">
      <ExploreFilters resultCount={venues.length} />
      <section className="rounded-[2rem] bg-white/80 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-secondary">Nearby sorted by distance</p>
            <h2 className="text-2xl font-bold">Within a handy stroll</h2>
          </div>
          <div className="rounded-full bg-secondary/10 px-3 py-2 text-secondary">
            <LocateFixed className="h-4 w-4" />
          </div>
        </div>
        {venues.length ? (
          <div className="grid gap-4 md:grid-cols-2">{venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}</div>
        ) : (
          <EmptyStateBlock
            ctaLabel="Add a missing beer garden"
            description="Try loosening the search or tags, or add the spot if it is missing from the map."
            title="No spots match those filters yet"
          />
        )}
      </section>
    </div>
  );
}
