import Link from 'next/link';
import { duplicateDetectionService } from '@/lib/services/duplicate-detection-service';
import { Card } from '@/components/ui/card';

export function DuplicateWarningList({ name, lat = 54.5839, lng = -5.9345 }: { name: string; lat?: number; lng?: number }) {
  const matches = name ? duplicateDetectionService.findPossibleDuplicates(name, lat, lng) : [];
  if (!matches.length) return null;
  return (
    <Card className="border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">Possible duplicates nearby</p>
      <div className="mt-3 space-y-3">
        {matches.map((venue) => (
          <Link key={venue.id} href={`/beer-garden/${venue.slug}`} className="block rounded-2xl bg-white p-3 text-sm hover:bg-amber-100">
            <div className="flex items-center justify-between gap-3"><div className="font-semibold">{venue.name}</div><div className="text-xs font-semibold text-amber-900">{Math.round(venue.distanceMeters)}m</div></div>
            <div className="text-slate-600">{venue.address}</div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
