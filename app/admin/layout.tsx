import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { getAdminAccessState } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await getAdminAccessState();

  if (access.isAdmin) {
    return children;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Trusted admin only</p>
        <h1 className="mt-3 text-3xl font-bold">Admin access requires a signed-in Supabase admin account</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          {access.user
            ? `Signed in as ${access.user.email ?? access.user.id}, but this user is not in admin_users.`
            : 'No authenticated Supabase session was found for this request.'}
        </p>
      </section>
      <Card className="p-5 text-sm text-slate-600">
        Add your user ID to <code>admin_users</code> in Supabase and sign in through the app before using moderation routes.
      </Card>
    </div>
  );
}
