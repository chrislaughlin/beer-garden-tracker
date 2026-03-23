import { adminModerationService } from '@/lib/services/admin-moderation-service';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminReportsPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const reports = await adminModerationService.listReports();
  return <div className="space-y-5"><div><p className="text-sm uppercase tracking-[0.24em] text-secondary">Admin reports</p><h1 className="text-3xl font-bold">Change requests and issue reports</h1></div><div className="grid gap-3">{reports.map((report) => <Card key={report.id} className="p-5"><div className="flex items-center justify-between"><h2 className="font-bold capitalize">{report.type}</h2><span className="text-xs text-slate-500">{report.createdAt}</span></div><p className="mt-2 text-sm text-slate-700">{report.reason}</p></Card>)}</div></div>;
}
