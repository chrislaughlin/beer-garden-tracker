import Link from 'next/link';
import { MapPin, Star, SunMedium, Clock3 } from 'lucide-react';
import { BeerGarden } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceKm } from '@/lib/utils';
import { getSunsetSummary } from '@/lib/services/sunset-service';

function buildRandomGradient() {
  const palettes = [
    {
      linear: ['hsl(212 38% 26%)', 'hsl(211 34% 40%)', 'hsl(36 33% 80%)'],
      blobs: ['hsla(204, 33%, 72%, 0.25)', 'hsla(220, 26%, 22%, 0.22)'],
    },
    {
      linear: ['hsl(14 51% 55%)', 'hsl(24 63% 70%)', 'hsl(165 36% 78%)'],
      blobs: ['hsla(20, 60%, 68%, 0.3)', 'hsla(160, 28%, 72%, 0.26)'],
    },
    {
      linear: ['hsl(195 30% 30%)', 'hsl(198 32% 48%)', 'hsl(34 45% 78%)'],
      blobs: ['hsla(200, 25%, 70%, 0.25)', 'hsla(30, 55%, 78%, 0.28)'],
    },
    {
      linear: ['hsl(16 60% 70%)', 'hsl(42 65% 82%)', 'hsl(106 30% 78%)'],
      blobs: ['hsla(32, 60%, 78%, 0.3)', 'hsla(105, 30%, 75%, 0.25)'],
    },
  ];

  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  const [c1, c2, c3] = palette.linear;
  const [blob1, blob2] = palette.blobs;

  const x1 = 20 + Math.random() * 30;
  const y1 = 15 + Math.random() * 25;
  const x2 = 60 + Math.random() * 25;
  const y2 = 55 + Math.random() * 35;

  const linear = `linear-gradient(140deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`;
  const softBlob1 = `radial-gradient(60% 80% at ${x1}% ${y1}%, ${blob1}, transparent 60%)`;
  const softBlob2 = `radial-gradient(70% 70% at ${x2}% ${y2}%, ${blob2}, transparent 65%)`;

  return `${softBlob1}, ${softBlob2}, ${linear}`;
}

export function VenueCard({ venue }: { venue: BeerGarden }) {
  const sunset = getSunsetSummary(venue.sunsetTime);
  const gradient = buildRandomGradient();
  return (
    <Link href={`/beer-garden/${venue.slug}`}>
      <Card className="overflow-hidden">
        <div
          className="relative w-full"
          style={{
            height: 'calc(11rem / 3)',
            backgroundImage: gradient,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '140% 140%',
          }}
        >
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
