import Link from 'next/link';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { Card } from '@/components/ui/card';
import { StatusChip } from '@/components/admin/status-chip';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminVenuesPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const venues = await beerGardenService.listForAdmin();
  return (
    <div className="space-y-5">
      <div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin venues</p><h1 className="text-3xl font-bold">All beer gardens</h1></div>
      <div className="rounded-[2rem] bg-white p-2 shadow-soft">
        <table className="w-full text-left text-sm">
          <thead><tr className="text-slate-500"><th className="p-4">Venue</th><th className="p-4">Status</th><th className="p-4">Confidence</th><th className="p-4">Region</th></tr></thead>
          <tbody>{venues.map((venue) => <tr key={venue.id} className="border-t border-border/60"><td className="p-4"><Link href={`/admin/venues/${venue.id}`} className="font-semibold hover:text-primary">{venue.name}</Link><div className="text-slate-500">{venue.address}</div></td><td className="p-4"><StatusChip status={venue.status} /></td><td className="p-4">{Math.round(venue.confidenceScore * 100)}%</td><td className="p-4 uppercase">{venue.region}</td></tr>)}</tbody>
        </table>
      </div>
      <Card className="p-5 text-sm text-slate-600">Visibility model in place for pending, approved, flagged, rejected, and closed venues.</Card>
    </div>
  );
}
