import { Badge } from '@/components/ui/badge';
import { VenueStatus } from '@/lib/types';

const statusClasses: Record<VenueStatus, string> = {
  approved: 'bg-secondary/10 text-secondary',
  pending: 'bg-amber-100 text-amber-900',
  flagged: 'bg-rose-100 text-rose-700',
  rejected: 'bg-slate-200 text-slate-700',
  closed: 'bg-slate-900 text-white'
};

export function StatusChip({ status }: { status: VenueStatus }) {
  return <Badge className={statusClasses[status]}>{status}</Badge>;
}
