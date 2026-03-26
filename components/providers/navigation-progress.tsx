'use client';

import NextTopLoader from 'nextjs-toploader';

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#f59e0b"
      height={3}
      crawlSpeed={200}
      showSpinner={false}
      easing="ease"
      speed={320}
      shadow="0 0 16px rgba(245, 158, 11, 0.35)"
    />
  );
}
