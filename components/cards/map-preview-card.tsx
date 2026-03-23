import { MapPinned } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MapPreviewCard() {
  return (
    <Card className="map-gradient p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Map preview</p>
          <h3 className="mt-2 text-xl font-bold">Nearby beer gardens around central Belfast</h3>
          <p className="mt-2 text-sm text-slate-700">MapLibre-ready panel with room for radius search, pin selection, and map/list switching.</p>
        </div>
        <div className="rounded-3xl bg-white/80 p-4"><MapPinned className="h-8 w-8 text-secondary" /></div>
      </div>
      <div className="mt-6 h-56 rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(77,124,15,0.16),rgba(255,255,255,0.2)),url('https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
      <div className="mt-4 flex gap-3">
        <Button variant="default">Map view</Button>
        <Button variant="ghost">List view</Button>
      </div>
    </Card>
  );
}
