import { reviewService } from '@/lib/services/review-service';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminReviewsPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const reviews = await reviewService.listRecent();
  return <div className="space-y-5"><div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin reviews</p><h1 className="text-3xl font-bold">Recent reviews</h1></div><div className="grid gap-3">{reviews.map((review) => <Card key={review.id} className="p-5"><div className="flex items-center justify-between"><h2 className="font-bold">{review.venueName}</h2><span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-amber-900">{review.status}</span></div><p className="mt-2 text-sm text-slate-700">{review.text}</p></Card>)}</div></div>;
}
