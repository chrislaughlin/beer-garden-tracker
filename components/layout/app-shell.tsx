import type { ReactNode } from 'react';
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
      <FooterNav />
    </div>
  );
}

function BadgePill() {
  return <div className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-amber-900">Region: Belfast</div>;
}
