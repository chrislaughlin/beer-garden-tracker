import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, MapPin, Star, SunMedium, Camera, MessageSquareWarning } from 'lucide-react';
import { BeerGardenMap } from '@/components/maps/beer-garden-map';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { DEFAULT_DETAIL_ZOOM } from '@/lib/maps';
import { getSunsetSummary } from '@/lib/services/sunset-service';
import { getFallbackPhoto } from '@/lib/data/fallback-photos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReviewCard } from '@/components/cards/review-card';
import { PhotoGrid } from '@/components/cards/photo-grid';

export default async function BeerGardenDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ submitted?: string }>;
}) {
  const { slug } = await params;
  const feedback = searchParams ? await searchParams : undefined;
  const venue = await beerGardenService.getBySlug(slug);
  if (!venue) notFound();
  const sunset = getSunsetSummary(venue.sunsetTime);
  const photoUrl = venue.photos[0]?.url ?? getFallbackPhoto({
    name: venue.name,
    description: venue.description,
    tags: venue.tags
  });
  const submissionMessage = feedback?.submitted === '1'
    ? venue.status === 'approved'
      ? 'Venue submitted and published.'
      : 'Venue submitted. This pending listing is visible only in this browser until moderation approves it.'
    : venue.status !== 'approved'
      ? 'This pending listing is visible only in this browser until moderation approves it.'
      : null;
  return (
    <div className="space-y-6">
      {submissionMessage ? (
        <Card className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {submissionMessage}
        </Card>
      ) : null}
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="relative h-72 w-full">
          <Image src={photoUrl} alt={venue.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Beer garden</p>
            <div className="mt-2 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">{venue.name}</h1><p className="mt-2 max-w-2xl text-sm text-white/80">{venue.description}</p></div><div className="rounded-3xl bg-white/15 px-4 py-3 text-right backdrop-blur"><div className="text-2xl font-bold">{venue.rating.toFixed(1)}</div><div className="text-xs text-white/80">{venue.reviewCount} reviews</div></div></div>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap gap-2">{venue.tags.map((tag) => <Badge key={tag} className="bg-muted text-slate-700">{tag}</Badge>)}</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-700"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" />{venue.address}</div><div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" />{venue.reviewCount} reviews and counting</div><div className="flex items-center gap-2"><SunMedium className="h-4 w-4 text-primary" />{venue.hasEveningSun ? 'Usually gets evening sun' : 'Better earlier in the day'}</div></div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-bold">Photo gallery</h2>
            <div className="mt-4"><PhotoGrid photos={venue.photos} /></div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Reviews</h2><Button variant="outline" asChild><Link href={`/review/${venue.id}`}>Add review</Link></Button></div>
            <div className="mt-4 space-y-3">{venue.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-slate-950 p-5 text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Sunset guide</p>
            <h2 className="mt-2 text-2xl font-bold">{sunset.label}</h2>
            <p className="mt-2 text-sm text-white/75">A lightweight Open-Meteo-ready decision aid for quick “should we head now?” moments.</p>
            <div className="mt-4 rounded-3xl bg-white/10 p-4"><div className="flex items-center gap-2 text-amber-300"><Clock3 className="h-4 w-4" />{Math.max(sunset.minutesLeft, 0)} minutes until sunset</div></div>
          </Card>
          <Card className="map-gradient p-5">
            <h2 className="text-xl font-bold">Map snippet</h2>
            <BeerGardenMap
              className="mt-4 h-52 rounded-[2rem] border border-white/60"
              markers={[{
                id: venue.id,
                name: venue.name,
                lat: venue.lat,
                lng: venue.lng,
                description: venue.address ?? venue.name
              }]}
              selectedMarkerId={venue.id}
              fitToMarkers={false}
              zoom={DEFAULT_DETAIL_ZOOM}
            />
            {venue.address ? <p className="mt-3 text-sm text-slate-700">{venue.address}</p> : null}
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-bold">Quick actions</h2>
            <div className="mt-4 grid gap-3"><Button asChild><Link href={`/review/${venue.id}`}>Add review</Link></Button><Button variant="outline"><Camera className="mr-2 h-4 w-4" />Add photo</Button><Button variant="ghost"><MessageSquareWarning className="mr-2 h-4 w-4" />Report issue</Button></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
