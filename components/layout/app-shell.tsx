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
          <h1 className="text-lg font-bold">☀️ Sunny Pint Finder 🍺</h1>
        </Link>
      </div>
      {children}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-soft">
        <p className="font-medium">Enjoying Sunny Pint Finder? Support the project and keep the pints flowing.</p>
        <a
          href="https://buymeacoffee.com/chrislaughlin"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
        >
          ☕ Buy me a coffee
        </a>
      </div>
      <Suspense fallback={<FooterNavFallback />}>
        <FooterNav />
      </Suspense>
    </div>
  );
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
