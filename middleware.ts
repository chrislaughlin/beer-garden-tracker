import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEFAULT_ADMIN_IDS = ['admin-demo-user-id'];

function getAllowedAdminIds() {
  return (process.env.ADMIN_ALLOWLIST_USER_IDS ?? DEFAULT_ADMIN_IDS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get('bg-admin-user-id')?.value;
  if (!adminCookie || !getAllowedAdminIds().includes(adminCookie)) {
    const url = new URL('/unauthorized', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
