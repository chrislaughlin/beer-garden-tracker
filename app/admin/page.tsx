import Link from 'next/link';
import { adminModerationService } from '@/lib/services/admin-moderation-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminPage() {
  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    return null;
  }

  const metrics = await adminModerationService.getMetrics();
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Trusted admin only</p>
        <h1 className="mt-3 text-3xl font-bold">Moderation cockpit for venue data cleanup</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/75">MVP guard: protect access with a trusted Supabase user allowlist or admin role table. No public admin routes.</p>
      </section>
      <section className="grid status-grid gap-4">{Object.entries(metrics).map(([key, value]) => <Card key={key} className="p-5"><p className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><div className="mt-2 text-3xl font-bold">{value}</div></Card>)}</section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[
        ['Venues', '/admin/venues', 'Approve, reject, edit, move pins, merge duplicates.'],
        ['Reviews', '/admin/reviews', 'Remove spam and spot suspicious anonymous submissions.'],
        ['Photos', '/admin/photos', 'Moderate uploaded venue and review images.'],
        ['Reports', '/admin/reports', 'Review issue reports and change requests.']
      ].map(([label, href, text]) => <Card key={href} className="p-5"><h2 className="text-xl font-bold">{label}</h2><p className="mt-2 text-sm text-slate-600">{text}</p><Button asChild className="mt-4"><Link href={href}>Open {label}</Link></Button></Card>)}</section>
    </div>
  );
}
