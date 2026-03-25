import Link from 'next/link';
import { MapPinned } from 'lucide-react';
import { BeerGardenMap } from '@/components/maps/beer-garden-map';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BeerGarden } from '@/lib/types';

type MapPreviewCardProps = {
  venues: Pick<BeerGarden, 'id' | 'slug' | 'name' | 'lat' | 'lng' | 'distanceMeters'>[];
};

export function MapPreviewCard({ venues }: MapPreviewCardProps) {
  return (
    <Card className="map-gradient p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Nearby beer gardens</p>
        </div>
        <div className="rounded-3xl bg-white/80 p-4"><MapPinned className="h-8 w-8 text-secondary" /></div>
      </div>
      <BeerGardenMap
        className="mt-6 h-56 rounded-[2rem] border border-white/60"
        markers={venues.map((venue) => ({
          id: venue.id,
          name: venue.name,
          lat: venue.lat,
          lng: venue.lng,
          description: venue.distanceMeters ? `${venue.name} · ${Math.round(venue.distanceMeters)}m away` : venue.name
        }))}
      />
      <div className="mt-4 flex gap-3">
        <Button variant="default" asChild><Link href="/explore">Map view</Link></Button>
        <Button variant="ghost" asChild><Link href="/explore">List view</Link></Button>
      </div>
    </Card>
  );
}
