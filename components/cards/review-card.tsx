import { Star } from 'lucide-react';
import { Review } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-primary">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
        {review.sunnyWhenVisited ? <Badge className="bg-accent text-amber-900">Sunny when visited</Badge> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{review.text}</p>
      <div className="mt-3 flex flex-wrap gap-2">{review.tags.map((tag) => <Badge key={tag} className="bg-muted text-slate-700">{tag}</Badge>)}</div>
    </Card>
  );
}
