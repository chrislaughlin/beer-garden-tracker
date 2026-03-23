import { Button } from '@/components/ui/button';

export function AdminActionBar() {
  return (
    <div className="flex flex-wrap gap-3 rounded-3xl bg-slate-950 p-3 text-white shadow-soft">
      <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">Approve</Button>
      <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">Flag</Button>
      <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">Mark closed</Button>
      <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20">Merge duplicate</Button>
    </div>
  );
}
