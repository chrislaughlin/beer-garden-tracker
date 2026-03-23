import { NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/review-service';

export async function GET() {
  return NextResponse.json({ data: reviewService.listRecent() });
}
