import { notFound } from 'next/navigation';
import Link from 'next/link';
import { beerGardenService } from '@/lib/services/beer-garden-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { submitReviewAction } from '@/app/review/[beerGardenId]/actions';

export default async function ReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ beerGardenId: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const { beerGardenId } = await params;
  const feedback = searchParams ? await searchParams : undefined;
  const venue = await beerGardenService.getById(beerGardenId);

  if (!venue) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="bg-slate-950 p-6 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Quick review</p>
        <h1 className="mt-2 text-3xl font-bold">{venue.name}</h1>
        <p className="mt-2 text-sm text-white/75">Fast, casual, and anonymous — more “how was it?” than “complete this survey”.</p>
      </Card>
      {feedback?.error ? <Card className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{feedback.error}</Card> : null}
      {feedback?.success ? <Card className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{feedback.success}</Card> : null}
      <form action={submitReviewAction}>
        <input name="beerGardenId" type="hidden" value={venue.id} />
        <Card className="space-y-5 p-5">
          <div>
            <p className="text-sm font-semibold">Your rating</p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer">
                  <input className="peer sr-only" name="rating" type="radio" value={n} required />
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-amber-900 transition peer-checked:bg-primary peer-checked:text-white">{n}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">A few words</p>
            <Textarea name="text" placeholder="What’s the spot like when the sun’s out?" required />
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm text-slate-700">
            <input name="sunnyWhenVisited" type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            It was sunny when I visited
          </label>
          <div>
            <p className="text-sm font-semibold">Quick tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Sunny spot', 'Dog friendly', 'Good atmosphere', 'Busy', 'Quiet', 'Food available', 'Covered seating'].map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-4 py-2 text-sm">{tag}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Tags are still visual guidance only. Review text and rating are the fields currently written to Supabase.</p>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Submit review</Button>
            <Button asChild variant="outline">
              <Link href={`/beer-garden/${venue.slug}`}>Back to venue</Link>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
