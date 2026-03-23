import { Search, LocateFixed } from 'lucide-react';
import { VenueCard } from '@/components/cards/venue-card';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { Input } from '@/components/ui/input';

export default function ExplorePage() {
  const venues = beerGardenService.listNearby();
  return (
    <div className="space-y-5">
      <div className="sticky top-4 z-10 rounded-[2rem] bg-white/90 p-4 shadow-soft backdrop-blur">
        <div className="flex items-center gap-3 rounded-2xl border bg-muted px-4 py-3"><Search className="h-4 w-4 text-slate-500" /><Input className="h-auto border-0 bg-transparent px-0" defaultValue="Central Belfast" aria-label="Search Belfast venues" /></div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">{['Map', 'List', 'Evening sun', 'Food', 'Dog friendly'].map((item) => <span key={item} className="rounded-full bg-accent px-4 py-2 font-medium text-amber-900">{item}</span>)}</div>
      </div>
      <section className="rounded-[2rem] bg-white/80 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Nearby sorted by distance</p><h2 className="text-2xl font-bold">Within a handy stroll</h2></div><div className="rounded-full bg-secondary/10 px-3 py-2 text-secondary"><LocateFixed className="h-4 w-4" /></div></div>
        <div className="grid gap-4 md:grid-cols-2">{venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}</div>
      </section>
    </div>
  );
}
