import { beerGardenService } from '@/lib/services/beer-garden-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default async function ReviewPage({ params }: { params: Promise<{ beerGardenId: string }> }) {
  const { beerGardenId } = await params;
  const venue = beerGardenService.getById(beerGardenId);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="bg-slate-950 p-6 text-white">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Quick review</p>
        <h1 className="mt-2 text-3xl font-bold">{venue?.name ?? 'Beer garden review'}</h1>
        <p className="mt-2 text-sm text-white/75">Fast, casual, and anonymous — more “how was it?” than “complete this survey”.</p>
      </Card>
      <Card className="space-y-5 p-5">
        <div><p className="text-sm font-semibold">Your rating</p><div className="mt-3 flex gap-2">{[1,2,3,4,5].map((n) => <button key={n} className="h-12 w-12 rounded-full bg-accent text-lg font-bold text-amber-900">{n}</button>)}</div></div>
        <div><p className="text-sm font-semibold">A few words</p><Textarea placeholder="What’s the spot like when the sun’s out?" /></div>
        <div><p className="text-sm font-semibold">Quick tags</p><div className="mt-3 flex flex-wrap gap-2">{['Sunny spot', 'Dog friendly', 'Good atmosphere', 'Busy', 'Quiet', 'Food available', 'Covered seating'].map((tag) => <span key={tag} className="rounded-full bg-muted px-4 py-2 text-sm">{tag}</span>)}</div></div>
        <div className="flex gap-3"><Button>Submit review</Button><Button variant="outline">Add photo</Button></div>
      </Card>
    </div>
  );
}
