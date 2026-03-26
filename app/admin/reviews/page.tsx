import { reviewService } from '@/lib/services/review-service';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ReviewStatusChip } from '@/components/admin/review-status-chip';
import { updateReviewStatusAction } from './actions';
import type { ModerationStatus } from '@/lib/types';

export default async function AdminReviewsPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const reviews = await reviewService.listRecent();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin reviews</p>
        <h1 className="text-3xl font-bold">Recent reviews</h1>
      </div>
      <div className="grid gap-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">{review.venueName}</h2>
                <p className="text-xs text-slate-500">Review ID: {review.id}</p>
              </div>
              <ReviewStatusChip status={review.status as ModerationStatus} />
            </div>
            <p className="mt-2 text-sm text-slate-700">{review.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {review.status === 'approved' ? (
                <form action={updateReviewStatusAction}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input type="hidden" name="venueSlug" value={review.venueSlug ?? ''} />
                  <input type="hidden" name="status" value="rejected" />
                  <Button type="submit" variant="outline">Unapprove</Button>
                </form>
              ) : (
                <form action={updateReviewStatusAction} className="flex gap-2">
                  <input type="hidden" name="reviewId" value={review.id} />
                  <input type="hidden" name="venueSlug" value={review.venueSlug ?? ''} />
                  <input type="hidden" name="status" value="approved" />
                  <Button type="submit">Approve</Button>
                </form>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
