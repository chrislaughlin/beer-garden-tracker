import type { ReactNode } from 'react';
import { Camera, MapPinned, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitVenueAction } from '@/app/add/actions';

const tagOptions = ['Sunny spot', 'Dog friendly', 'Quiet', 'Food available', 'Covered seating'];

export default async function AddBeerGardenPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const feedback = searchParams ? await searchParams : undefined;

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Add a beer garden</p>
        <h1 className="mt-3 text-3xl font-bold">A quick mobile flow for filling in the gaps</h1>
        <p className="mt-2 text-sm text-white/75">Anonymous submission, Turnstile-ready, with duplicate detection before the final tap.</p>
      </section>
      {feedback?.error ? <Card className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{feedback.error}</Card> : null}
      {feedback?.success ? <Card className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{feedback.success}</Card> : null}
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <form action={submitVenueAction}>
          <Card className="space-y-5 p-5">
            <Step number="1" title="Pick the spot on the map" icon={<MapPinned className="h-5 w-5" />}>
              <div className="h-56 rounded-[2rem] bg-[linear-gradient(135deg,rgba(77,124,15,0.15),rgba(245,158,11,0.15))]" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input name="lat" type="number" step="0.000001" placeholder="Latitude, e.g. 54.5839" required />
                <Input name="lng" type="number" step="0.000001" placeholder="Longitude, e.g. -5.9345" required />
              </div>
            </Step>
            <Step number="2" title="Name the venue">
              <Input name="name" placeholder="Venue name" required />
              <Input className="mt-3" name="address" placeholder="Address or area" />
            </Step>
            <Step number="3" title="Optional details and tags" icon={<Tag className="h-5 w-5" />}>
              <Textarea name="description" placeholder="What makes this spot worth adding?" />
              <label className="mt-3 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm text-slate-700">
                <input name="hasEveningSun" type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                This spot usually gets evening sun
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <label key={tag} className="flex cursor-pointer items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-slate-700">
                    <input name="tags" type="checkbox" value={tag} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    {tag}
                  </label>
                ))}
              </div>
            </Step>
            <Step number="4" title="Upload a photo" icon={<Camera className="h-5 w-5" />}>
              <div className="rounded-[2rem] border border-dashed border-border bg-muted p-5 text-sm text-slate-600">Photo upload is still a follow-up. Submit the venue first and moderation can review it immediately.</div>
            </Step>
            <Step number="5" title="Review and submit" icon={<CheckCircle2 className="h-5 w-5" />}>
              <div className="rounded-3xl bg-amber-50 p-4 text-sm text-slate-700">New venues are written to Supabase immediately, then stay pending until an admin approves them.</div>
              <div className="mt-3 flex gap-3"><Button type="submit">Submit venue</Button></div>
            </Step>
          </Card>
        </form>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-bold">Submission guardrails</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>• Region is locked to <strong>belfast</strong> for MVP.</li>
              <li>• Venue submissions now write straight to Supabase.</li>
              <li>• Public visibility still follows moderation status.</li>
              <li>• Turnstile, anon auth ownership, and upload flow are still next steps.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, icon, children }: { number: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return <div className="rounded-[2rem] bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-amber-900">{number}</div><div><div className="flex items-center gap-2 text-lg font-bold">{title} {icon}</div></div></div>{children}</div>;
}
