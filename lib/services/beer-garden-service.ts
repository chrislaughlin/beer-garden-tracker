import { getPlaceholderSunsetIso } from '@/lib/services/sunset-service';
import { getSubmissionPreviewIds } from '@/lib/submission-preview';
import { getPublicServerClient, getServiceRoleClient } from '@/lib/supabase';
import type { BeerGarden, Photo, Review } from '@/lib/types';

const BELFAST_CENTER = {
  lat: 54.597,
  lng: -5.93,
  radiusMeters: 5000
};

type BeerGardenRow = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  description: string | null;
  region: 'belfast';
  source: 'user' | 'seed' | 'admin';
  has_evening_sun: boolean | null;
  status: BeerGarden['status'];
  confidence_score: number | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type ReviewRow = {
  id: string;
  beer_garden_id: string;
  user_id: string | null;
  rating: number;
  text: string;
  sunny_when_visited: boolean | null;
  status: Review['status'];
  created_at: string;
};

type PhotoRow = {
  id: string;
  beer_garden_id: string | null;
  review_id: string | null;
  storage_path: string;
  uploaded_by_user_id: string | null;
  moderation_status: Photo['moderationStatus'];
  created_at: string;
};

type VenueTagRow = {
  beer_garden_id: string;
  tag: string;
};

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Map<string, T[]>>((groups, item) => {
    const key = getKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map());
}

function getDistanceMeters(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => value * (Math.PI / 180);
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);
  const fromLatRadians = toRadians(fromLat);
  const toLatRadians = toRadians(toLat);
  const haversine = Math.sin(latDelta / 2) ** 2
    + Math.cos(fromLatRadians) * Math.cos(toLatRadians) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

async function getPreviewVenueIds() {
  return new Set(await getSubmissionPreviewIds());
}

async function listPreviewVenueRows(previewVenueIds: Set<string>) {
  const ids = Array.from(previewVenueIds);

  if (!ids.length) {
    return [];
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('beer_gardens')
    .select('*')
    .eq('region', 'belfast')
    .in('id', ids);

  if (error) {
    throw error;
  }

  return (data ?? []) as BeerGardenRow[];
}

async function resolvePhotoUrls(photos: PhotoRow[]) {
  const signedPaths = Array.from(
    new Set(
      photos
        .map((photo) => photo.storage_path)
        .filter((path) => path && !path.startsWith('http://') && !path.startsWith('https://'))
    )
  );

  if (!signedPaths.length) {
    return new Map<string, string>();
  }

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.storage.from('photos').createSignedUrls(signedPaths, 60 * 60);

  if (error || !data) {
    return new Map<string, string>();
  }

  return data.reduce((signedUrlByPath, entry) => {
    if (entry.path && entry.signedUrl) {
      signedUrlByPath.set(entry.path, entry.signedUrl);
    }

    return signedUrlByPath;
  }, new Map<string, string>());
}

function mapReview(review: ReviewRow): Review {
  return {
    id: review.id,
    beerGardenId: review.beer_garden_id,
    userId: review.user_id ?? '',
    rating: review.rating,
    text: review.text,
    sunnyWhenVisited: review.sunny_when_visited ?? undefined,
    status: review.status,
    createdAt: review.created_at,
    tags: []
  };
}

function mapPhoto(photo: PhotoRow, signedUrlByPath: Map<string, string>): Photo | null {
  const url = photo.storage_path.startsWith('http://') || photo.storage_path.startsWith('https://')
    ? photo.storage_path
    : signedUrlByPath.get(photo.storage_path);

  if (!url) {
    return null;
  }

  return {
    id: photo.id,
    beerGardenId: photo.beer_garden_id ?? undefined,
    reviewId: photo.review_id ?? undefined,
    storagePath: photo.storage_path,
    uploadedByUserId: photo.uploaded_by_user_id ?? '',
    moderationStatus: photo.moderation_status,
    createdAt: photo.created_at,
    url
  };
}

async function hydrateVenues(
  rows: BeerGardenRow[],
  distanceById = new Map<string, number>(),
  previewVenueIds = new Set<string>()
) {
  if (!rows.length) {
    return [];
  }

  const supabase = await getPublicServerClient();
  const venueIds = rows.map((row) => row.id);
  const previewIds = venueIds.filter((venueId) => previewVenueIds.has(venueId));
  const serviceRoleClient = previewIds.length ? getServiceRoleClient() : null;

  const [
    { data: tagRows, error: tagError },
    { data: reviewRows, error: reviewError },
    { data: photoRows, error: photoError },
    { data: previewTagRows, error: previewTagError },
    { data: previewReviewRows, error: previewReviewError },
    { data: previewPhotoRows, error: previewPhotoError }
  ] = await Promise.all([
    supabase.from('venue_tags').select('beer_garden_id, tag').in('beer_garden_id', venueIds),
    supabase
      .from('reviews')
      .select('id, beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at')
      .in('beer_garden_id', venueIds)
      .order('created_at', { ascending: false }),
    supabase
      .from('photos')
      .select('id, beer_garden_id, review_id, storage_path, uploaded_by_user_id, moderation_status, created_at')
      .in('beer_garden_id', venueIds)
      .order('created_at', { ascending: false }),
    previewIds.length && serviceRoleClient
      ? serviceRoleClient.from('venue_tags').select('beer_garden_id, tag').in('beer_garden_id', previewIds)
      : Promise.resolve({ data: [] as VenueTagRow[], error: null }),
    previewIds.length && serviceRoleClient
      ? serviceRoleClient
        .from('reviews')
        .select('id, beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at')
        .in('beer_garden_id', previewIds)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ReviewRow[], error: null }),
    previewIds.length && serviceRoleClient
      ? serviceRoleClient
        .from('photos')
        .select('id, beer_garden_id, review_id, storage_path, uploaded_by_user_id, moderation_status, created_at')
        .in('beer_garden_id', previewIds)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as PhotoRow[], error: null })
  ]);

  if (tagError) {
    throw tagError;
  }

  if (reviewError) {
    throw reviewError;
  }

  if (photoError) {
    throw photoError;
  }

  if (previewTagError) {
    throw previewTagError;
  }

  if (previewReviewError) {
    throw previewReviewError;
  }

  if (previewPhotoError) {
    throw previewPhotoError;
  }

  const mergedTagRows = [...(tagRows ?? []), ...(previewTagRows ?? [])];
  const mergedReviewRows = [...(reviewRows ?? []), ...(previewReviewRows ?? [])];
  const mergedPhotoRows = [...(photoRows ?? []), ...(previewPhotoRows ?? [])];
  const tagsByVenue = groupBy(mergedTagRows, (tag) => tag.beer_garden_id);
  const reviewsByVenue = groupBy(mergedReviewRows, (review) => review.beer_garden_id);
  const photosByVenue = groupBy(mergedPhotoRows, (photo) => photo.beer_garden_id ?? '');
  const signedUrlByPath = await resolvePhotoUrls(mergedPhotoRows);

  return rows.map((row) => {
    const reviews = (reviewsByVenue.get(row.id) ?? []).map(mapReview);
    const photos = (photosByVenue.get(row.id) ?? [])
      .map((photo) => mapPhoto(photo, signedUrlByPath))
      .filter((photo): photo is Photo => Boolean(photo));
    const reviewCount = reviews.length;
    const rating = reviewCount
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
      : 0;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      address: row.address ?? undefined,
      description: row.description ?? undefined,
      region: row.region,
      source: row.source,
      hasEveningSun: row.has_evening_sun ?? undefined,
      status: row.status,
      confidenceScore: row.confidence_score ?? 0,
      createdByUserId: row.created_by_user_id ?? '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tags: (tagsByVenue.get(row.id) ?? []).map((tag) => tag.tag),
      distanceMeters: distanceById.get(row.id) ?? 0,
      rating,
      reviewCount,
      photos,
      reviews,
      sunsetTime: getPlaceholderSunsetIso()
    } satisfies BeerGarden;
  });
}

async function listNearbyDistanceRows() {
  const supabase = await getPublicServerClient();
  const { data, error } = await supabase.rpc('nearby_beer_gardens', {
    search_lat: BELFAST_CENTER.lat,
    search_lng: BELFAST_CENTER.lng,
    radius_m: BELFAST_CENTER.radiusMeters
  });

  if (error || !data) {
    return new Map<string, number>();
  }

  return new Map<string, number>((data as Array<{ id: string; distance_m: number }>).map((row) => [row.id, row.distance_m]));
}

function applySearch(rows: BeerGardenRow[], query?: string) {
  if (!query?.trim()) {
    return rows;
  }

  const needle = query.trim().toLowerCase();
  return rows.filter((row) => row.name.toLowerCase().includes(needle) || row.address?.toLowerCase().includes(needle));
}

export const beerGardenService = {
  async listNearby(query?: string, filters: string[] = []) {
    const [supabase, distanceById, previewVenueIds] = await Promise.all([
      getPublicServerClient(),
      listNearbyDistanceRows(),
      getPreviewVenueIds()
    ]);
    const previewRows = await listPreviewVenueRows(previewVenueIds);
    const nearbyIds = Array.from(distanceById.keys());
    const venueQuery = supabase.from('beer_gardens').select('*').eq('region', 'belfast');

    const { data, error } = nearbyIds.length
      ? await venueQuery.in('id', nearbyIds)
      : await venueQuery.order('name');

    if (error) {
      throw error;
    }

    previewRows.forEach((row) => {
      if (distanceById.has(row.id)) {
        return;
      }

      const distanceMeters = getDistanceMeters(BELFAST_CENTER.lat, BELFAST_CENTER.lng, row.lat, row.lng);

      if (distanceMeters <= BELFAST_CENTER.radiusMeters) {
        distanceById.set(row.id, distanceMeters);
      }
    });

    const mergedRowsById = new Map<string, BeerGardenRow>();

    ((data ?? []) as BeerGardenRow[]).forEach((row) => {
      mergedRowsById.set(row.id, row);
    });

    previewRows
      .filter((row) => distanceById.has(row.id))
      .forEach((row) => {
        mergedRowsById.set(row.id, row);
      });

    const hydrated = await hydrateVenues(
      applySearch(Array.from(mergedRowsById.values()), query),
      distanceById,
      previewVenueIds
    );
    return hydrated
      .filter((venue) => filters.length === 0 || filters.every((filter) => venue.tags.includes(filter)))
      .sort((left, right) => left.distanceMeters - right.distanceMeters || right.rating - left.rating);
  },

  async getBySlug(slug: string) {
    const supabase = await getPublicServerClient();
    const { data, error } = await supabase.from('beer_gardens').select('*').eq('slug', slug).maybeSingle();

    if (error) {
      throw error;
    }

    let row = data as BeerGardenRow | null;

    if (!row) {
      const previewVenueIds = await getPreviewVenueIds();

      if (!previewVenueIds.size) {
        return undefined;
      }

      const serviceRoleClient = getServiceRoleClient();
      const { data: previewRow, error: previewError } = await serviceRoleClient
        .from('beer_gardens')
        .select('*')
        .eq('slug', slug)
        .in('id', Array.from(previewVenueIds))
        .maybeSingle();

      if (previewError) {
        throw previewError;
      }

      row = previewRow as BeerGardenRow | null;
      if (!row) {
        return undefined;
      }

      const [venue] = await hydrateVenues([row], new Map(), previewVenueIds);
      return venue;
    }

    const [venue] = await hydrateVenues([row]);
    return venue;
  },

  async getById(id: string) {
    const supabase = await getPublicServerClient();
    const { data, error } = await supabase.from('beer_gardens').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw error;
    }

    let row = data as BeerGardenRow | null;

    if (!row) {
      const previewVenueIds = await getPreviewVenueIds();

      if (!previewVenueIds.has(id)) {
        return undefined;
      }

      const serviceRoleClient = getServiceRoleClient();
      const { data: previewRow, error: previewError } = await serviceRoleClient
        .from('beer_gardens')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (previewError) {
        throw previewError;
      }

      row = previewRow as BeerGardenRow | null;
      if (!row) {
        return undefined;
      }

      const [venue] = await hydrateVenues([row], new Map(), previewVenueIds);
      return venue;
    }

    const [venue] = await hydrateVenues([row]);
    return venue;
  },

  async listForAdmin(status?: string) {
    const supabase = await getPublicServerClient();
    let query = supabase.from('beer_gardens').select('*').eq('region', 'belfast').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return hydrateVenues((data ?? []) as BeerGardenRow[]);
  }
};
