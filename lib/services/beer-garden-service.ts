import { getPlaceholderSunsetIso } from '@/lib/services/sunset-service';
import { getSubmissionPreviewIds } from '@/lib/submission-preview';
import { getPublicServerClient, getServiceRoleClient } from '@/lib/supabase';
import { BELFAST_CENTER } from '@/lib/maps';
import type { ListNearbyOptions } from '@/lib/discovery';
import type { BeerGarden, Photo, Review } from '@/lib/types';

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

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Map<string, T[]>>((groups, item) => {
    const key = getKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map());
}

function uniqueStrings(values: string[]) {
  return uniqueBy(
    values
      .map((value) => value.trim())
      .filter(Boolean),
    (value) => value
  );
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

async function listBeerGardenRows() {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('beer_gardens')
    .select('*')
    .eq('region', 'belfast')
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as BeerGardenRow[];
}

async function getBeerGardenRowBySlug(slug: string) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('beer_gardens')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BeerGardenRow | null;
}

async function getBeerGardenRowById(id: string) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('beer_gardens')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BeerGardenRow | null;
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

  const publicClient = await getPublicServerClient();
  const serviceRoleClient = getServiceRoleClient();
  const venueIds = rows.map((row) => row.id);
  const previewIds = venueIds.filter((venueId) => previewVenueIds.has(venueId));

  const [
    { data: tagRows, error: tagError },
    { data: reviewRows, error: reviewError },
    { data: photoRows, error: photoError },
    { data: previewReviewRows, error: previewReviewError },
    { data: previewPhotoRows, error: previewPhotoError }
  ] = await Promise.all([
    // Venue rows are intentionally fetched with the service role so pending venues stay visible in the dogfood app.
    serviceRoleClient.from('venue_tags').select('beer_garden_id, tag').in('beer_garden_id', venueIds),
    publicClient
      .from('reviews')
      .select('id, beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at')
      .in('beer_garden_id', venueIds)
      .order('created_at', { ascending: false }),
    publicClient
      .from('photos')
      .select('id, beer_garden_id, review_id, storage_path, uploaded_by_user_id, moderation_status, created_at')
      .in('beer_garden_id', venueIds)
      .order('created_at', { ascending: false }),
    previewIds.length
      ? serviceRoleClient
        .from('reviews')
        .select('id, beer_garden_id, user_id, rating, text, sunny_when_visited, status, created_at')
        .in('beer_garden_id', previewIds)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ReviewRow[], error: null }),
    previewIds.length
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

  if (previewReviewError) {
    throw previewReviewError;
  }

  if (previewPhotoError) {
    throw previewPhotoError;
  }

  const mergedTagRows = uniqueBy(
    [...(tagRows ?? [])],
    (tag) => `${tag.beer_garden_id}:${tag.tag}`
  );
  const mergedReviewRows = uniqueBy(
    [...(reviewRows ?? []), ...(previewReviewRows ?? [])],
    (review) => review.id
  );
  const mergedPhotoRows = uniqueBy(
    [...(photoRows ?? []), ...(previewPhotoRows ?? [])],
    (photo) => photo.id
  );
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
      tags: uniqueStrings((tagsByVenue.get(row.id) ?? []).map((tag) => tag.tag)),
      distanceMeters: distanceById.get(row.id) ?? 0,
      rating,
      reviewCount,
      photos,
      reviews,
      sunsetTime: getPlaceholderSunsetIso()
    } satisfies BeerGarden;
  });
}

function applySearch(rows: BeerGardenRow[], query?: string) {
  if (!query?.trim()) {
    return rows;
  }

  const needle = query.trim().toLowerCase();
  return rows.filter((row) => row.name.toLowerCase().includes(needle) || row.address?.toLowerCase().includes(needle));
}

function applyEveningSun(rows: BeerGardenRow[], hasEveningSun?: boolean) {
  if (!hasEveningSun) {
    return rows;
  }

  return rows.filter((row) => Boolean(row.has_evening_sun));
}

export const beerGardenService = {
  async listNearby(options: ListNearbyOptions = {}) {
    const [rows, previewVenueIds] = await Promise.all([
      listBeerGardenRows(),
      getPreviewVenueIds()
    ]);
    const tags = uniqueStrings(options.tags ?? []);
    const origin = options.origin ?? BELFAST_CENTER;

    const filteredRows = applyEveningSun(
      applySearch(rows, options.query),
      options.hasEveningSun
    );
    const distanceById = new Map<string, number>(
      filteredRows.map((row) => [row.id, getDistanceMeters(origin.lat, origin.lng, row.lat, row.lng)])
    );

    const hydrated = await hydrateVenues(
      filteredRows,
      distanceById,
      previewVenueIds
    );
    return hydrated
      .filter((venue) => tags.length === 0 || tags.every((tag) => venue.tags.includes(tag)))
      .sort((left, right) => left.distanceMeters - right.distanceMeters || right.rating - left.rating);
  },

  async getBySlug(slug: string) {
    const [row, previewVenueIds] = await Promise.all([
      getBeerGardenRowBySlug(slug),
      getPreviewVenueIds()
    ]);

    if (!row) {
      return undefined;
    }

    const [venue] = await hydrateVenues([row], new Map(), previewVenueIds);
    return venue;
  },

  async getById(id: string) {
    const [row, previewVenueIds] = await Promise.all([
      getBeerGardenRowById(id),
      getPreviewVenueIds()
    ]);

    if (!row) {
      return undefined;
    }

    const [venue] = await hydrateVenues([row], new Map(), previewVenueIds);
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
