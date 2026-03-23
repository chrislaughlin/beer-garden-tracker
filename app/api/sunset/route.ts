import { NextResponse } from 'next/server';
import { getSunsetSummary } from '@/lib/services/sunset-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sunset = searchParams.get('sunset');
  if (!sunset) {
    return NextResponse.json({ error: 'sunset query parameter is required' }, { status: 400 });
  }
  return NextResponse.json({ data: getSunsetSummary(sunset) });
}
