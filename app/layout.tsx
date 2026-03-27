import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { QueryProvider } from '@/components/providers/query-provider';
import { NavigationProgress } from '@/components/providers/navigation-progress';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Beer Garden Tracker',
  description: 'Find nearby beer gardens, add missing spots, and help keep the map tidy.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
