import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { FooterNav } from '@/components/layout/footer-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between rounded-full bg-white/75 px-4 py-3 shadow-soft backdrop-blur">
        <Link href="/" className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
          <p className="text-xs uppercase tracking-[0.24em] text-secondary">Beer Garden Tracker</p>
          <h1 className="text-lg font-bold">Belfast sunny pint finder</h1>
        </Link>
        <BadgePill />
      </div>
      {children}
      <Suspense fallback={<FooterNavFallback />}>
        <FooterNav />
      </Suspense>
    </div>
  );
}

function BadgePill() {
  return <div className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-amber-900">Region: Belfast</div>;
}

function FooterNavFallback() {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md items-center justify-around rounded-full border border-white/50 bg-slate-950 px-3 py-2 text-white shadow-2xl shadow-slate-900/20">
      <Link href="/" className="flex min-w-16 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white">
        Home
      </Link>
      <Link href="/explore" className="flex min-w-16 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white">
        Explore
      </Link>
      <Link href="/add" className="flex min-w-16 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white">
        Add spot
      </Link>
    </nav>
  );
}
