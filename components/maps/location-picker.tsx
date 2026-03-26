'use client';

import { LocateFixed, MapPinned, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BeerGardenMap } from '@/components/maps/beer-garden-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BELFAST_CENTER, DEFAULT_CITY_ZOOM, DEFAULT_DETAIL_ZOOM, getMapStyle } from '@/lib/maps';

type Coordinates = {
  lat: number;
  lng: number;
};

function parseCoordinate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createMarkerElement(className: string, ariaLabel: string) {
  const markerElement = document.createElement('button');
  markerElement.type = 'button';
  markerElement.className = className;
  markerElement.setAttribute('aria-label', ariaLabel);
  return markerElement;
}

export function LocationPicker() {
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenMapRef = useRef<import('maplibre-gl').Map | null>(null);
  const fullscreenMarkerRef = useRef<import('maplibre-gl').Marker | null>(null);
  const fullscreenUserMarkerRef = useRef<import('maplibre-gl').Marker | null>(null);
  const fullscreenMaplibreRef = useRef<typeof import('maplibre-gl') | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPickerReady, setIsPickerReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [pickerErrorMessage, setPickerErrorMessage] = useState<string | null>(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  const hasCoordinates = parsedLat !== undefined && parsedLng !== undefined;

  function updateCoordinates(nextLat: number, nextLng: number) {
    setLat(nextLat.toFixed(6));
    setLng(nextLng.toFixed(6));
  }

  function focusMap(nextLat: number, nextLng: number, minimumZoom = DEFAULT_DETAIL_ZOOM) {
    const map = fullscreenMapRef.current;

    if (!map) {
      return;
    }

    map.easeTo({
      center: [nextLng, nextLat],
      zoom: Math.max(map.getZoom(), minimumZoom),
      duration: 350,
      essential: true
    });
  }

  function syncSelectedMarker(nextLat: number, nextLng: number) {
    const map = fullscreenMapRef.current;
    const maplibregl = fullscreenMaplibreRef.current;

    if (!map || !maplibregl) {
      return;
    }

    if (!fullscreenMarkerRef.current) {
      const marker = new maplibregl.Marker({
        element: createMarkerElement('beer-garden-map-marker is-active', 'Selected venue location'),
        anchor: 'center',
        draggable: true
      })
        .setLngLat([nextLng, nextLat])
        .addTo(map);

      marker.on('dragend', () => {
        const point = marker.getLngLat();
        updateCoordinates(point.lat, point.lng);
      });

      fullscreenMarkerRef.current = marker;
      return;
    }

    fullscreenMarkerRef.current.setLngLat([nextLng, nextLat]);
  }

  function syncCurrentLocationMarker(location: Coordinates) {
    const map = fullscreenMapRef.current;
    const maplibregl = fullscreenMaplibreRef.current;

    if (!map || !maplibregl) {
      return;
    }

    if (!fullscreenUserMarkerRef.current) {
      fullscreenUserMarkerRef.current = new maplibregl.Marker({
        element: createMarkerElement('beer-garden-user-marker', 'Your current location'),
        anchor: 'center'
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map);

      return;
    }

    fullscreenUserMarkerRef.current.setLngLat([location.lng, location.lat]);
  }

  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationErrorMessage('Current location is unavailable on this device.');
      return;
    }

    setIsLocating(true);
    setLocationErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCurrentLocation(location);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocationErrorMessage('Location permission was unavailable, so the map stayed on the default area.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPickerOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    requestCurrentLocation();
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      try {
        const maplibregl = await import('maplibre-gl');

        if (cancelled || !fullscreenContainerRef.current) {
          return;
        }

        fullscreenMaplibreRef.current = maplibregl;

        const initialCenter = hasCoordinates && parsedLat !== undefined && parsedLng !== undefined
          ? { lat: parsedLat, lng: parsedLng }
          : currentLocation ?? BELFAST_CENTER;
        const initialZoom = hasCoordinates ? DEFAULT_DETAIL_ZOOM : currentLocation ? 15.5 : DEFAULT_CITY_ZOOM;

        const map = new maplibregl.Map({
          container: fullscreenContainerRef.current,
          style: getMapStyle(),
          center: [initialCenter.lng, initialCenter.lat],
          zoom: initialZoom,
          attributionControl: false
        });

        fullscreenMapRef.current = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        map.on('click', (event) => {
          updateCoordinates(event.lngLat.lat, event.lngLat.lng);
          focusMap(event.lngLat.lat, event.lngLat.lng);
        });

        map.once('load', () => {
          if (cancelled) {
            return;
          }

          setIsPickerReady(true);
          window.requestAnimationFrame(() => {
            map.resize();
          });
        });
      } catch {
        if (!cancelled) {
          setPickerErrorMessage('Map preview is unavailable right now.');
        }
      }
    }

    setIsPickerReady(false);
    setPickerErrorMessage(null);
    void initMap();

    return () => {
      cancelled = true;
      fullscreenMarkerRef.current?.remove();
      fullscreenMarkerRef.current = null;
      fullscreenUserMarkerRef.current?.remove();
      fullscreenUserMarkerRef.current = null;
      const map = fullscreenMapRef.current;
      fullscreenMapRef.current = null;
      fullscreenMaplibreRef.current = null;
      map?.remove();
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen || !isPickerReady) {
      return;
    }

    if (!hasCoordinates || parsedLat === undefined || parsedLng === undefined) {
      fullscreenMarkerRef.current?.remove();
      fullscreenMarkerRef.current = null;
      return;
    }

    syncSelectedMarker(parsedLat, parsedLng);
  }, [hasCoordinates, isPickerOpen, isPickerReady, parsedLat, parsedLng]);

  useEffect(() => {
    if (!isPickerOpen || !isPickerReady || !currentLocation) {
      return;
    }

    syncCurrentLocationMarker(currentLocation);
    focusMap(currentLocation.lat, currentLocation.lng, 15.5);
  }, [currentLocation, isPickerOpen, isPickerReady]);

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
      <div className="relative h-64 overflow-hidden rounded-[2rem] border border-border/60 bg-slate-100">
        <BeerGardenMap
          className="h-full"
          center={hasCoordinates && parsedLat !== undefined && parsedLng !== undefined ? { lat: parsedLat, lng: parsedLng } : BELFAST_CENTER}
          zoom={hasCoordinates ? DEFAULT_DETAIL_ZOOM : DEFAULT_CITY_ZOOM}
          fitToMarkers={false}
          markers={hasCoordinates && parsedLat !== undefined && parsedLng !== undefined ? [{
            id: 'selected-location',
            name: 'Selected venue location',
            lat: parsedLat,
            lng: parsedLng,
            description: address || 'Selected venue location'
          }] : []}
          selectedMarkerId="selected-location"
        />
        <button
          type="button"
          className="absolute inset-0 z-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          onClick={() => setIsPickerOpen(true)}
          aria-label="Open the full-screen map picker"
        >
          <span className="pointer-events-none absolute inset-x-4 bottom-4 block rounded-2xl bg-white/50 px-4 py-3 text-sm text-slate-700 shadow-lg backdrop-blur">
            <span className="flex items-center gap-2 font-medium text-slate-900">
              <LocateFixed className="h-4 w-4 text-secondary" />
              {hasCoordinates ? 'Open the full-screen map to refine the pin.' : 'Open a full-screen map near your current location.'}
            </span>
          </span>
        </button>
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

      {isPickerOpen ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/45 p-3 sm:p-6" onClick={() => setIsPickerOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Full-screen map picker"
            className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-[#fcfaf4] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Map picker</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Find the venue from your current location</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={requestCurrentLocation}>
                  <LocateFixed className="mr-2 h-4 w-4" />
                  Use my location
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPickerOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Done
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3 sm:p-4">
              <div className="beer-garden-map relative h-full overflow-hidden rounded-[1.75rem] border border-border/60 bg-slate-100">
                <div ref={fullscreenContainerRef} className="h-full w-full" />
                {pickerErrorMessage ? (
                  <div className="pointer-events-none absolute inset-4 flex items-end">
                    <div className="rounded-2xl bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-lg">{pickerErrorMessage}</div>
                  </div>
                ) : null}
                {!pickerErrorMessage && !isPickerReady ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
                    <div className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      <MapPinned className="h-4 w-4 text-secondary" />
                      Loading full-screen map
                    </div>
                  </div>
                ) : null}
                <div className="pointer-events-none absolute inset-x-4 bottom-4">
                  <div className="rounded-2xl bg-slate-950/82 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
                    <p className="font-medium">{hasCoordinates ? 'Venue pin selected.' : 'No venue pin selected yet.'}</p>
                    <p className="mt-1 text-white/80">
                      {hasCoordinates ? `${lat}, ${lng}` : 'Tap the map once you have moved to the bar location.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
