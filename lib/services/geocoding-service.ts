import 'server-only';

type ReverseGeocodeFeature = {
  place_name?: string;
};

type ReverseGeocodeResponse = {
  features?: ReverseGeocodeFeature[];
};

function sanitizeAddress(value?: string) {
  if (!value) {
    return undefined;
  }

  return value.replace(/,\s*United Kingdom$/i, '').trim() || undefined;
}

async function fetchReverseGeocode(lat: number, lng: number, types?: string[]) {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  if (!key) {
    return undefined;
  }

  const params = new URLSearchParams({
    key,
    limit: '1'
  });

  if (types?.length) {
    params.set('types', types.join(','));
  }

  const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?${params.toString()}`, {
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return undefined;
  }

  const data = await response.json() as ReverseGeocodeResponse;
  return sanitizeAddress(data.features?.[0]?.place_name);
}

export async function reverseGeocodeCoordinates(lat: number, lng: number) {
  const typedResult = await fetchReverseGeocode(lat, lng, ['address', 'street', 'neighbourhood', 'locality']);

  if (typedResult) {
    return typedResult;
  }

  return fetchReverseGeocode(lat, lng);
}
