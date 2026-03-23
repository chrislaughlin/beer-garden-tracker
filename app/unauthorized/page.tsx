import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function UnauthorizedPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <div className="mx-auto max-w-xl py-10">
      <Card className="p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">Restricted admin area</p>
        <h1 className="mt-2 text-3xl font-bold">That section is for trusted admins only</h1>
        <p className="mt-3 text-sm text-slate-600">For the MVP, admin access is protected by an allowlisted Supabase user id mirrored into the <code>bg-admin-user-id</code> cookie.</p>
        {from ? <p className="mt-2 text-xs text-slate-500">Attempted route: {from}</p> : null}
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild><Link href="/">Back home</Link></Button>
          <Button variant="outline" asChild><Link href="/explore">Explore venues</Link></Button>
        </div>
      </Card>
    </div>
  );
}
