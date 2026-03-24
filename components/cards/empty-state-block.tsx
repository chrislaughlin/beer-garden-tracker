import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type EmptyStateBlockProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EmptyStateBlock({
  title = 'No beer gardens added here yet',
  description = 'Be the first to add one and help build the Belfast map properly.',
  ctaLabel = 'Be the first to add one',
  ctaHref = '/add'
}: EmptyStateBlockProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-lime-50 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Sparse data? That’s alright.</p>
      <h3 className="mt-3 text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Button asChild className="mt-5"><Link href={ctaHref}>{ctaLabel}</Link></Button>
    </Card>
  );
}
