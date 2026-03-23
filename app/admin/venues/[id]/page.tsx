import { notFound } from 'next/navigation';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { AdminActionBar } from '@/components/admin/action-bar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusChip } from '@/components/admin/status-chip';

export default async function AdminVenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = beerGardenService.getById(id);
  if (!venue) notFound();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin venue detail</p><h1 className="text-3xl font-bold">{venue.name}</h1></div><StatusChip status={venue.status} /></div>
      <AdminActionBar />
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4 p-5"><h2 className="text-xl font-bold">Edit venue details</h2><Input defaultValue={venue.name} /><Input defaultValue={venue.address} /><Textarea defaultValue={venue.description} /><div className="grid grid-cols-2 gap-3"><Input defaultValue={String(venue.lat)} /><Input defaultValue={String(venue.lng)} /></div></Card>
        <Card className="space-y-4 p-5"><h2 className="text-xl font-bold">Duplicate merge helper</h2><div className="grid gap-3 md:grid-cols-2"><div className="rounded-3xl bg-muted p-4"><p className="font-semibold">Primary record</p><p className="mt-2 text-sm text-slate-600">{venue.name}</p></div><div className="rounded-3xl bg-amber-50 p-4"><p className="font-semibold">Potential duplicate</p><p className="mt-2 text-sm text-slate-600">Harbour Hop Belfast</p></div></div><div className="h-56 rounded-[2rem] bg-[linear-gradient(135deg,rgba(77,124,15,0.15),rgba(245,158,11,0.15))]" /></Card>
      </div>
    </div>
  );
}
