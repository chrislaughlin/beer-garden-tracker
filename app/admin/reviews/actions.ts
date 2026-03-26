'use server';

import { revalidatePath } from 'next/cache';
import { getPublicServerClient } from '@/lib/supabase';
import { getAdminAccessState } from '@/lib/auth';
import { ModerationStatus } from '@/lib/types';

const ALLOWED_STATUSES: ModerationStatus[] = ['approved', 'rejected'];

export async function updateReviewStatusAction(formData: FormData) {
  const reviewId = String(formData.get('reviewId') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim() as ModerationStatus;
  const venueSlug = String(formData.get('venueSlug') ?? '').trim();

  if (!reviewId || !ALLOWED_STATUSES.includes(status)) {
    throw new Error('Invalid review status update.');
  }

  const access = await getAdminAccessState();

  if (!access.isAdmin) {
    throw new Error('Admin access required.');
  }

  const supabase = await getPublicServerClient();
  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId);

  if (error) {
    throw error;
  }

  if (venueSlug) {
    revalidatePath(`/beer-garden/${venueSlug}`);
  }

  revalidatePath('/');
  revalidatePath('/explore');
  revalidatePath('/admin/reviews');
}
