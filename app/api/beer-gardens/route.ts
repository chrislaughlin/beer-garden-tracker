import { NextResponse } from 'next/server';
import { beerGardenService } from '@/lib/services/beer-garden-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') ?? undefined;
  const filters = searchParams.getAll('filter');
  const status = searchParams.get('status') ?? undefined;
  const venues = status ? beerGardenService.listForAdmin(status) : beerGardenService.listNearby(query, filters);
  return NextResponse.json({ data: venues });
}
