'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getPublicServerClient } from '@/lib/supabase';
import { reviewSchema } from '@/lib/validation';

function buildRedirect(path: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return search.size ? `${path}?${search.toString()}` : path;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitReviewAction(formData: FormData) {
  const beerGardenId = getString(formData, 'beerGardenId');
  const redirectPath = `/review/${beerGardenId || 'unknown'}`;
  const parsed = reviewSchema.safeParse({
    beerGardenId,
    rating: Number(formData.get('rating')),
    text: getString(formData, 'text'),
    sunnyWhenVisited: formData.get('sunnyWhenVisited') === 'on',
    tags: formData.getAll('tags').map((value) => String(value))
  });

  if (!parsed.success) {
    redirect(buildRedirect(redirectPath, { error: parsed.error.issues[0]?.message ?? 'Check the review form and try again.' }));
  }

  const supabase = await getPublicServerClient();
  const { data: venue, error: venueError } = await supabase
    .from('beer_gardens')
    .select('id, slug')
    .eq('id', parsed.data.beerGardenId)
    .maybeSingle();

  if (venueError || !venue) {
    redirect(buildRedirect(redirectPath, { error: 'That venue could not be found.' }));
  }

  const { error } = await supabase.from('reviews').insert({
    beer_garden_id: parsed.data.beerGardenId,
    user_id: null,
    rating: parsed.data.rating,
    text: parsed.data.text,
    sunny_when_visited: parsed.data.sunnyWhenVisited ?? false,
    status: 'pending'
  });

  if (error) {
    redirect(buildRedirect(redirectPath, { error: 'Supabase rejected that review. Try again.' }));
  }

  revalidatePath('/');
  revalidatePath('/explore');
  revalidatePath(`/beer-garden/${venue.slug}`);
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');

  redirect(buildRedirect(redirectPath, { success: 'Review submitted. It is now waiting for moderation.' }));
}
