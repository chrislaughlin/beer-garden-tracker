import { NextRequest, NextResponse } from 'next/server';
import { generateHeroImageDataUri } from '@/lib/services/hero-image-service';

export const runtime = 'nodejs';

function decodeTagList(raw: string | null) {
  if (!raw) {
    return [];
  }

  return raw
    .split('|')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name') ?? 'Beer garden';
  const description = request.nextUrl.searchParams.get('description') ?? '';
  const tags = decodeTagList(request.nextUrl.searchParams.get('tags'));

  const dataUri = await generateHeroImageDataUri(name, description, tags);
  const encodedSvg = dataUri.split(',', 2)[1] ?? '';
  const svg = decodeURIComponent(encodedSvg);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
    }
  });
}
