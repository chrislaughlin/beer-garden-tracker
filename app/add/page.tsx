import type { ReactNode } from 'react';
import { Camera, MapPinned, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DuplicateWarningList } from '@/components/add-flow/duplicate-warning-list';

const draftName = 'Botanic Terrace';

export default function AddBeerGardenPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Add a beer garden</p>
        <h1 className="mt-3 text-3xl font-bold">A quick mobile flow for filling in the gaps</h1>
        <p className="mt-2 text-sm text-white/75">Anonymous submission, Turnstile-ready, with duplicate detection before the final tap.</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5 p-5">
          <Step number="1" title="Pick the spot on the map" icon={<MapPinned className="h-5 w-5" />}>
            <div className="h-56 rounded-[2rem] bg-[linear-gradient(135deg,rgba(77,124,15,0.15),rgba(245,158,11,0.15))]" />
          </Step>
          <Step number="2" title="Name the venue">
            <Input defaultValue={draftName} />
          </Step>
          <Step number="3" title="Optional details and tags" icon={<Tag className="h-5 w-5" />}>
            <Textarea defaultValue="Hidden courtyard off Botanic with enough space for a small group." />
            <div className="mt-3 flex flex-wrap gap-2">{['Sunny spot', 'Dog friendly', 'Quiet', 'Food available', 'Covered seating'].map((tag) => <span key={tag} className="rounded-full bg-muted px-4 py-2 text-sm">{tag}</span>)}</div>
          </Step>
          <Step number="4" title="Upload a photo" icon={<Camera className="h-5 w-5" />}>
            <div className="rounded-[2rem] border border-dashed border-border bg-muted p-5 text-sm text-slate-600">Drop photo here or use Supabase Storage upload on mobile.</div>
          </Step>
          <Step number="5" title="Review and submit" icon={<CheckCircle2 className="h-5 w-5" />}>
            <div className="rounded-3xl bg-amber-50 p-4 text-sm text-slate-700">Newly added venues can appear immediately to you, while public visibility follows moderation status.</div>
            <div className="mt-3 flex gap-3"><Button>Submit venue</Button><Button variant="ghost">Save draft</Button></div>
          </Step>
        </Card>
        <div className="space-y-4"><DuplicateWarningList name={draftName} /><Card className="p-5"><h2 className="text-xl font-bold">Submission guardrails</h2><ul className="mt-4 space-y-3 text-sm text-slate-700"><li>• Region is locked to <strong>belfast</strong> for MVP.</li><li>• Anonymous auth keeps the flow low-friction.</li><li>• Turnstile + IP and anon-user rate limiting are expected at submit time.</li><li>• Admins can tidy map pins, merge duplicates, and approve quality spots quickly.</li></ul></Card></div>
      </div>
    </div>
  );
}

function Step({ number, title, icon, children }: { number: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return <div className="rounded-[2rem] bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-amber-900">{number}</div><div><div className="flex items-center gap-2 text-lg font-bold">{title} {icon}</div></div></div>{children}</div>;
}
