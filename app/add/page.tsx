import type { ReactNode } from 'react';
import { MapPinned, Tag, CheckCircle2 } from 'lucide-react';
import { LocationPicker } from '@/components/maps/location-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitVenueAction } from '@/app/add/actions';
import { VENUE_TAG_SUGGESTIONS } from '@/lib/discovery';

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
      </section>
      {feedback?.error ? <Card className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{feedback.error}</Card> : null}
      {feedback?.success ? <Card className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{feedback.success}</Card> : null}
      <div className="mx-auto max-w-3xl">
        <form action={submitVenueAction}>
          <Card className="space-y-5 p-5">
            <Step number="1" title="Pick the spot on the map" icon={<MapPinned className="h-5 w-5" />}>
              <LocationPicker />
            </Step>
            <Step number="2" title="Name the venue">
              <Input name="name" placeholder="Venue name" required />
            </Step>
            <Step number="3" title="Optional details and tags" icon={<Tag className="h-5 w-5" />}>
              <Textarea name="description" placeholder="What makes this spot worth adding?" />
              <label className="mt-3 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm text-slate-700">
                <input name="hasEveningSun" type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                This spot usually gets evening sun
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {VENUE_TAG_SUGGESTIONS.map((tag) => (
                  <label key={tag} className="flex cursor-pointer items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-slate-700">
                    <input name="tags" type="checkbox" value={tag} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    {tag}
                  </label>
                ))}
              </div>
            </Step>
            <Step number="4" title="Submit" icon={<CheckCircle2 className="h-5 w-5" />}>
              <div className="mt-3 flex gap-3"><Button type="submit">Submit venue</Button></div>
            </Step>
          </Card>
        </form>
      </div>
    </div>
  );
}

function Step({ number, title, icon, children }: { number: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return <div className="rounded-[2rem] bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-amber-900">{number}</div><div><div className="flex items-center gap-2 text-lg font-bold">{title} {icon}</div></div></div>{children}</div>;
}
