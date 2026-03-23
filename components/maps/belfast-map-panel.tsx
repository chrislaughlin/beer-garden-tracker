import { MapPinned, LocateFixed, MoveHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BelfastMapPanel({ title = 'Live map area', description = 'MapLibre mount point for venue discovery, pin placement, and map/list switching.' }: { title?: string; description?: string }) {
  return (
    <Card className="map-gradient overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">MapLibre-ready</p>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
          <p className="mt-2 text-sm text-slate-700">{description}</p>
        </div>
        <div className="rounded-3xl bg-white/75 p-4"><MapPinned className="h-8 w-8 text-secondary" /></div>
      </div>
      <div className="mt-6 grid h-64 place-items-center rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_35%),linear-gradient(135deg,rgba(77,124,15,0.18),rgba(255,255,255,0.45))] text-center">
        <div>
          <p className="text-lg font-bold">Central Belfast preview</p>
          <p className="mt-2 text-sm text-slate-700">Swap this panel for a real MapLibre canvas without changing page structure.</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700">Cathedral Quarter</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700">Titanic Quarter</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700">Botanic</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="default"><LocateFixed className="mr-2 h-4 w-4" />Near me</Button>
        <Button variant="ghost"><MoveHorizontal className="mr-2 h-4 w-4" />Toggle list</Button>
      </div>
    </Card>
  );
}
