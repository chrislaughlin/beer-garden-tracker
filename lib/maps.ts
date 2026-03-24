import type { StyleSpecification } from 'maplibre-gl';

export const BELFAST_CENTER = {
  lat: 54.597,
  lng: -5.93
} as const;

export const DEFAULT_CITY_ZOOM = 12.5;
export const DEFAULT_DETAIL_ZOOM = 14.5;

const openStreetMapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
} satisfies StyleSpecification;

export function getMapStyle(): StyleSpecification | string {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  if (mapTilerKey) {
    return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${mapTilerKey}`;
  }

  return openStreetMapStyle;
}
