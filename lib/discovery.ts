export const VENUE_TAG_SUGGESTIONS = [
  'Sunny spot',
  'Dog friendly',
  'Quiet',
  'Food available',
  'Covered seating',
  'Good atmosphere',
  'Big tables',
  'Heated seating',
  'Family friendly',
  'Great views'
] as const;

export const HOME_QUICK_FILTER_TAGS = [
  'Dog friendly',
  'Food available',
  'Covered seating',
  'Quiet'
] as const;

type ParamValue = string | string[] | undefined;

export type ExploreSearchParams = {
  q?: ParamValue;
  tag?: ParamValue;
  sun?: ParamValue;
  lat?: ParamValue;
  lng?: ParamValue;
  rating_min?: ParamValue;
  rating_max?: ParamValue;
};

export type DiscoverOrigin = {
  lat: number;
  lng: number;
};

export type ListNearbyOptions = {
  query?: string;
  tags?: string[];
  hasEveningSun?: boolean;
  origin?: DiscoverOrigin;
  ratingMin?: number;
  ratingMax?: number;
};

function getFirstValue(value: ParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function getAllValues(value: ParamValue) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function parseCoordinate(value: ParamValue) {
  const candidate = getFirstValue(value);

  if (!candidate?.trim()) {
    return undefined;
  }

  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRating(value: ParamValue) {
  const candidate = getFirstValue(value);

  if (!candidate?.trim()) {
    return undefined;
  }

  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function parseExploreSearchParams(searchParams?: ExploreSearchParams): Required<Pick<ListNearbyOptions, 'tags'>> & ListNearbyOptions {
  const query = getFirstValue(searchParams?.q)?.trim() ?? '';
  const tags = uniqueStrings(getAllValues(searchParams?.tag));
  const hasEveningSun = getFirstValue(searchParams?.sun) === '1';
  const lat = parseCoordinate(searchParams?.lat);
  const lng = parseCoordinate(searchParams?.lng);
  const ratingMin = parseRating(searchParams?.rating_min);
  const ratingMax = parseRating(searchParams?.rating_max);

  return {
    query,
    tags,
    hasEveningSun,
    origin: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    ratingMin,
    ratingMax
  };
}

export function buildExploreHref(options: ListNearbyOptions = {}) {
  const params = new URLSearchParams();
  const query = options.query?.trim();
  const tags = uniqueStrings(options.tags ?? []);
  const ratingMin = options.ratingMin;
  const ratingMax = options.ratingMax;

  if (query) {
    params.set('q', query);
  }

  tags.forEach((tag) => {
    params.append('tag', tag);
  });

  if (options.hasEveningSun) {
    params.set('sun', '1');
  }

  if (ratingMin !== undefined && Number.isFinite(ratingMin)) {
    params.set('rating_min', String(ratingMin));
  }

  if (ratingMax !== undefined && Number.isFinite(ratingMax)) {
    params.set('rating_max', String(ratingMax));
  }

  if (options.origin) {
    params.set('lat', options.origin.lat.toFixed(6));
    params.set('lng', options.origin.lng.toFixed(6));
  }

  const search = params.toString();
  return search ? `/explore?${search}` : '/explore';
}
