'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { reverseGeocodeCoordinates } from '@/lib/services/geocoding-service';
import { getPublicServerClient } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { addVenueSchema } from '@/lib/validation';

function buildRedirect(path: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return search.size ? `${path}?${search.toString()}` : path;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value || undefined;
}

async function resolveUniqueSlug(baseSlug: string) {
  const supabase = await getPublicServerClient();
  const { data, error } = await supabase.from('beer_gardens').select('slug').like('slug', `${baseSlug}%`);

  if (error) {
    throw error;
  }

  const used = new Set((data ?? []).map((row) => row.slug));

  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (used.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function submitVenueAction(formData: FormData) {
  const parsed = addVenueSchema.safeParse({
    name: getString(formData, 'name'),
    lat: Number(formData.get('lat')),
    lng: Number(formData.get('lng')),
    address: getOptionalString(formData, 'address'),
    description: getOptionalString(formData, 'description'),
    hasEveningSun: formData.get('hasEveningSun') === 'on',
    tags: formData.getAll('tags').map((value) => String(value))
  });

  if (!parsed.success) {
    redirect(buildRedirect('/add', { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' }));
  }

  const supabase = await getPublicServerClient();
  const baseSlug = slugify(parsed.data.name) || 'beer-garden';
  const slug = await resolveUniqueSlug(baseSlug);
  const address = parsed.data.address ?? await reverseGeocodeCoordinates(parsed.data.lat, parsed.data.lng);

  const { data: venue, error } = await supabase
    .from('beer_gardens')
    .insert({
      slug,
      name: parsed.data.name,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      address,
      description: parsed.data.description,
      source: 'user',
      has_evening_sun: parsed.data.hasEveningSun ?? false,
      status: 'pending',
      confidence_score: 0.6,
      created_by_user_id: null
    })
    .select('id')
    .single();

  if (error || !venue) {
    redirect(buildRedirect('/add', { error: 'Supabase rejected that venue submission. Try again.' }));
  }

  if (parsed.data.tags.length > 0) {
    const { error: tagError } = await supabase.from('venue_tags').insert(
      parsed.data.tags.map((tag) => ({
        beer_garden_id: venue.id,
        tag
      }))
    );

    if (tagError) {
      redirect(buildRedirect('/add', { error: 'The venue was created, but tags could not be saved.' }));
    }
  }

  revalidatePath('/');
  revalidatePath('/explore');
  revalidatePath('/admin');
  revalidatePath('/admin/venues');
  revalidatePath(`/beer-garden/${slug}`);
  redirect(buildRedirect(`/beer-garden/${slug}`, { submitted: '1' }));
}
