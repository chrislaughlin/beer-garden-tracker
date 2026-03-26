import { Badge } from '@/components/ui/badge';
import { ModerationStatus } from '@/lib/types';

const statusClasses: Record<ModerationStatus, string> = {
  approved: 'bg-secondary/10 text-secondary',
  pending: 'bg-amber-100 text-amber-900',
  flagged: 'bg-rose-100 text-rose-700',
  rejected: 'bg-slate-200 text-slate-700'
};

export function ReviewStatusChip({ status }: { status: ModerationStatus }) {
  return <Badge className={statusClasses[status]}>{status}</Badge>;
}
