'use client';

import { MapPinned } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BELFAST_CENTER, DEFAULT_CITY_ZOOM, getMapStyle } from '@/lib/maps';
import { cn } from '@/lib/utils';

type MapMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
};

type Coordinates = {
  lat: number;
  lng: number;
};

type BeerGardenMapProps = {
  markers?: MapMarker[];
  center?: Coordinates;
  zoom?: number;
  className?: string;
  selectedMarkerId?: string;
  fitToMarkers?: boolean;
};

function isValidCoordinate(value: number) {
  return Number.isFinite(value);
}

export function BeerGardenMap({
  markers = [],
  center = BELFAST_CENTER,
  zoom = DEFAULT_CITY_ZOOM,
  className,
  selectedMarkerId,
  fitToMarkers = true
}: BeerGardenMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: import('maplibre-gl').Map | null = null;

    async function initMap() {
      try {
        const maplibregl = await import('maplibre-gl');

        if (cancelled || !containerRef.current) {
          return;
        }

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: getMapStyle(),
          center: [center.lng, center.lat],
          zoom,
          attributionControl: false
        });

        mapInstance = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.scrollZoom.disable();

        const validMarkers = markers.filter((marker) => isValidCoordinate(marker.lat) && isValidCoordinate(marker.lng));
        const bounds = new maplibregl.LngLatBounds();

        validMarkers.forEach((marker) => {
          const markerElement = document.createElement('button');
          markerElement.type = 'button';
          markerElement.className = marker.id === selectedMarkerId ? 'beer-garden-map-marker is-active' : 'beer-garden-map-marker';
          markerElement.setAttribute('aria-label', marker.name);

          const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setText(marker.description ?? marker.name);

          new maplibregl.Marker({ element: markerElement, anchor: 'center' })
            .setLngLat([marker.lng, marker.lat])
            .setPopup(popup)
            .addTo(map);

          bounds.extend([marker.lng, marker.lat]);
        });

        if (validMarkers.length > 1 && fitToMarkers) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
        } else if (validMarkers.length) {
          const focusMarker = validMarkers.find((marker) => marker.id === selectedMarkerId) ?? validMarkers[0];
          map.setCenter([focusMarker.lng, focusMarker.lat]);
          map.setZoom(zoom);
        }

        map.once('load', () => {
          if (cancelled) {
            return;
          }

          setIsReady(true);
          window.requestAnimationFrame(() => {
            map.resize();
          });
        });
      } catch {
        if (!cancelled) {
          setErrorMessage('Map preview is unavailable right now.');
        }
      }
    }

    setIsReady(false);
    setErrorMessage(null);
    void initMap();

    return () => {
      cancelled = true;
      mapInstance?.remove();
    };
  }, [center.lat, center.lng, fitToMarkers, markers, selectedMarkerId, zoom]);

  return (
    <div className={cn('beer-garden-map relative overflow-hidden rounded-[inherit] bg-slate-100', className)}>
      <div ref={containerRef} className="h-full w-full" />
      {errorMessage ? (
        <div className="pointer-events-none absolute inset-4 flex items-end">
          <div className="rounded-2xl bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-lg">{errorMessage}</div>
        </div>
      ) : null}
      {!errorMessage && !isReady ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <MapPinned className="h-4 w-4 text-secondary" />
            Loading map
          </div>
        </div>
      ) : null}
    </div>
  );
}
