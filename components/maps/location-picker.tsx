'use client';

import { LocateFixed, MapPinned } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BELFAST_CENTER, DEFAULT_CITY_ZOOM, DEFAULT_DETAIL_ZOOM, getMapStyle } from '@/lib/maps';

function parseCoordinate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function LocationPicker() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const markerRef = useRef<import('maplibre-gl').Marker | null>(null);
  const maplibreRef = useRef<typeof import('maplibre-gl') | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  const hasCoordinates = parsedLat !== undefined && parsedLng !== undefined;

  function updateCoordinates(nextLat: number, nextLng: number) {
    setLat(nextLat.toFixed(6));
    setLng(nextLng.toFixed(6));
  }

  function ensureMarker(nextLat: number, nextLng: number) {
    const map = mapRef.current;
    const maplibregl = maplibreRef.current;

    if (!map || !maplibregl) {
      return;
    }

    if (!markerRef.current) {
      const markerElement = document.createElement('button');
      markerElement.type = 'button';
      markerElement.className = 'beer-garden-map-marker is-active';
      markerElement.setAttribute('aria-label', 'Selected venue location');

      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'center',
        draggable: true
      })
        .setLngLat([nextLng, nextLat])
        .addTo(map);

      marker.on('dragend', () => {
        const point = marker.getLngLat();
        updateCoordinates(point.lat, point.lng);
      });

      markerRef.current = marker;
      return;
    }

    markerRef.current.setLngLat([nextLng, nextLat]);
  }

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const maplibregl = await import('maplibre-gl');

        if (cancelled || !containerRef.current) {
          return;
        }

        maplibreRef.current = maplibregl;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: getMapStyle(),
          center: [BELFAST_CENTER.lng, BELFAST_CENTER.lat],
          zoom: DEFAULT_CITY_ZOOM,
          attributionControl: false
        });

        mapRef.current = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
        map.scrollZoom.disable();

        map.on('click', (event) => {
          updateCoordinates(event.lngLat.lat, event.lngLat.lng);
          map.easeTo({
            center: [event.lngLat.lng, event.lngLat.lat],
            zoom: Math.max(map.getZoom(), DEFAULT_DETAIL_ZOOM),
            duration: 350,
            essential: true
          });
        });

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
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      maplibreRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (!hasCoordinates || parsedLat === undefined || parsedLng === undefined) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    ensureMarker(parsedLat, parsedLng);
    map.easeTo({
      center: [parsedLng, parsedLat],
      zoom: Math.max(map.getZoom(), DEFAULT_DETAIL_ZOOM),
      duration: 300,
      essential: true
    });
  }, [hasCoordinates, parsedLat, parsedLng]);

  useEffect(() => {
    if (parsedLat === undefined || parsedLng === undefined) {
      setIsAddressLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsAddressLoading(true);

        const response = await fetch(`/api/reverse-geocode?lat=${parsedLat}&lng=${parsedLng}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json() as { address?: string | null };

        setAddress(data.address ?? '');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setIsAddressLoading(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsAddressLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [parsedLat, parsedLng]);

  return (
    <div className="space-y-3">
      <div className="beer-garden-map relative h-64 overflow-hidden rounded-[2rem] border border-border/60 bg-slate-100">
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
        <div className="pointer-events-none absolute inset-x-4 bottom-4">
          <div className="rounded-2xl bg-white/92 px-4 py-3 text-sm text-slate-700 shadow-lg">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <LocateFixed className="h-4 w-4 text-secondary" />
              {hasCoordinates ? 'Pin placed. Drag it or edit the fields below.' : 'Tap the map to drop a pin for the venue.'}
            </div>
            <p className="mt-1 text-slate-600">If the exact spot is tricky on mobile, you can still type the coordinates manually.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name="lat"
          type="number"
          inputMode="decimal"
          step="0.000001"
          placeholder="Latitude, e.g. 54.583900"
          required
          value={lat}
          onChange={(event) => setLat(event.target.value)}
        />
        <Input
          name="lng"
          type="number"
          inputMode="decimal"
          step="0.000001"
          placeholder="Longitude, e.g. -5.934500"
          required
          value={lng}
          onChange={(event) => setLng(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Input
          name="address"
          placeholder="Detected address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <p className="text-sm text-slate-600">
          {isAddressLoading ? 'Looking up the address for this pin…' : 'Address is auto-filled from the pin location, but you can adjust it before submitting.'}
        </p>
      </div>
    </div>
  );
}
