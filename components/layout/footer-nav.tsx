'use client';

import Link from 'next/link';
import { Compass, MapPinned, PlusSquare, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Compass },
  { href: '/explore', label: 'Explore', icon: MapPinned },
  { href: '/add', label: 'Add spot', icon: PlusSquare },
  { href: '/admin', label: 'Admin', icon: ShieldCheck, requiresAdminParam: true }
];

export function FooterNav() {
  const searchParams = useSearchParams();
  const hasAdminParam = searchParams.has('iamtheadmin');
  const adminParamValue = searchParams.get('iamtheadmin') ?? '';

  function buildHref(href: string) {
    if (!hasAdminParam) {
      return href;
    }

    const params = new URLSearchParams();
    params.set('iamtheadmin', adminParamValue);
    return `${href}?${params.toString()}`;
  }

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md items-center justify-around rounded-full border border-white/50 bg-slate-950 px-3 py-2 text-white shadow-2xl shadow-slate-900/20">
      {navItems
        .filter((item) => !item.requiresAdminParam || hasAdminParam)
        .map(({ href, label, icon: Icon }) => (
          <Link key={href} href={buildHref(href)} className={cn('flex min-w-16 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white')}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
    </nav>
  );
}
