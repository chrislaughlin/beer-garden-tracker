import { NextResponse } from 'next/server';
import { reverseGeocodeCoordinates } from '@/lib/services/geocoding-service';

function parseCoordinate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'));
  const lng = parseCoordinate(searchParams.get('lng'));

  if (lat === undefined || lng === undefined) {
    return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 });
  }

  const address = await reverseGeocodeCoordinates(lat, lng);

  return NextResponse.json({
    address: address ?? null
  });
}
