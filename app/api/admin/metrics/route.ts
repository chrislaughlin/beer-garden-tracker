import { NextResponse } from 'next/server';
import { adminModerationService } from '@/lib/services/admin-moderation-service';

export async function GET() {
  return NextResponse.json({ data: adminModerationService.getMetrics() });
}
