import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, SunMedium, Clock3 } from 'lucide-react';
import { BeerGarden } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceKm } from '@/lib/utils';
import { getSunsetSummary } from '@/lib/services/sunset-service';
import { getFallbackPhoto } from '@/lib/data/fallback-photos';

export function VenueCard({ venue }: { venue: BeerGarden }) {
  const sunset = getSunsetSummary(venue.sunsetTime);
  const photoUrl = venue.photos[0]?.url ?? getFallbackPhoto({
    name: venue.name,
    description: venue.description,
    tags: venue.tags
  });
  const isGeneratedHero = photoUrl.startsWith('/api/hero-image');
  return (
    <Link href={`/beer-garden/${venue.slug}`}>
      <Card className="overflow-hidden">
        <div className="relative h-44 w-full">
          <Image src={photoUrl} alt={venue.name} fill className="object-cover" unoptimized={isGeneratedHero} />
          <div className="absolute inset-x-0 top-0 flex justify-between p-3">
            <Badge className="bg-white/85 text-slate-900">{sunset.label}</Badge>
            <Badge className="bg-slate-950/75 text-white">{venue.status}</Badge>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">{venue.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{venue.description}</p>
            </div>
            <div className="rounded-2xl bg-accent px-3 py-2 text-right text-sm font-semibold text-amber-900">
              {venue.rating.toFixed(1)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{formatDistanceKm(venue.distanceMeters)}</span>
            <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{venue.reviewCount} reviews</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{Math.max(sunset.minutesLeft, 0)} min to sunset</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {venue.tags.slice(0, 3).map((tag) => <Badge key={tag} className="bg-muted text-slate-700">{tag}</Badge>)}
            {venue.hasEveningSun ? <Badge className="bg-secondary/10 text-secondary"><SunMedium className="mr-1 h-3.5 w-3.5" />Evening sun</Badge> : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
