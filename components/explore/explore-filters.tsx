'use client';

import { LocateFixed, LoaderCircle, Search, SunMedium, X } from 'lucide-react';
import { useDeferredValue, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { VENUE_TAG_SUGGESTIONS } from '@/lib/discovery';
import { cn } from '@/lib/utils';

type ExploreFiltersProps = {
  resultCount: number;
};

type LocationStatus = 'idle' | 'locating' | 'ready' | 'fallback';

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

export function ExploreFilters({ resultCount }: ExploreFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const activeQuery = searchParams.get('q') ?? '';
  const activeTags = searchParams.getAll('tag');
  const activeTagKey = activeTags.join('||');
  const activeHasEveningSun = searchParams.get('sun') === '1';
  const activeLat = searchParams.get('lat');
  const activeLng = searchParams.get('lng');
  const [search, setSearch] = useState(activeQuery);
  const [selectedTags, setSelectedTags] = useState(activeTags);
  const [hasEveningSun, setHasEveningSun] = useState(activeHasEveningSun);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    activeLat && activeLng ? { lat: Number(activeLat), lng: Number(activeLng) } : null
  );
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(activeLat && activeLng ? 'ready' : 'idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(
    activeLat && activeLng ? 'Sorted by your current location.' : null
  );
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const hasActiveFilters = Boolean(search.trim() || selectedTags.length || hasEveningSun);

  function replaceOriginInCurrentUrl(nextOrigin: { lat: number; lng: number } | null) {
    const params = new URLSearchParams(window.location.search);

    if (nextOrigin) {
      params.set('lat', formatCoordinate(nextOrigin.lat));
      params.set('lng', formatCoordinate(nextOrigin.lng));
    } else {
      params.delete('lat');
      params.delete('lng');
    }

    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function replaceUrl(options: {
    query?: string;
    tags?: string[];
    hasEveningSun?: boolean;
    origin?: { lat: number; lng: number } | null;
  }) {
    const params = new URLSearchParams(searchParamsKey);
    const nextQuery = (options.query ?? search).trim();
    const nextTags = options.tags ?? selectedTags;
    const nextHasEveningSun = options.hasEveningSun ?? hasEveningSun;
    const nextOrigin = options.origin === undefined
      ? origin
      : options.origin;

    if (nextQuery) {
      params.set('q', nextQuery);
    } else {
      params.delete('q');
    }

    params.delete('tag');
    nextTags.forEach((tag) => {
      params.append('tag', tag);
    });

    if (nextHasEveningSun) {
      params.set('sun', '1');
    } else {
      params.delete('sun');
    }

    if (nextOrigin) {
      params.set('lat', formatCoordinate(nextOrigin.lat));
      params.set('lng', formatCoordinate(nextOrigin.lng));
    } else {
      params.delete('lat');
      params.delete('lng');
    }

    const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  useEffect(() => {
    setSearch(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    setSelectedTags(activeTags);
  }, [activeTagKey]);

  useEffect(() => {
    setHasEveningSun(activeHasEveningSun);
  }, [activeHasEveningSun]);

  useEffect(() => {
    setOrigin(activeLat && activeLng ? { lat: Number(activeLat), lng: Number(activeLng) } : null);
  }, [activeLat, activeLng]);

  useEffect(() => {
    if (deferredSearch.trim() === activeQuery.trim()) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      replaceUrl({ query: deferredSearch });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeQuery, deferredSearch, searchParamsKey, selectedTags, hasEveningSun, origin]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setOrigin(null);
      setLocationStatus('fallback');
      setLocationMessage('Location is unavailable on this device, so results are sorted from the center of nearby venues.');

      if (window.location.search.includes('lat=') || window.location.search.includes('lng=')) {
        replaceOriginInCurrentUrl(null);
      }

      return;
    }

    setLocationStatus('locating');
    setLocationMessage('Finding your location for distance sorting…');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentSearchParams = new URLSearchParams(window.location.search);
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const originChanged = formatCoordinate(origin.lat) !== currentSearchParams.get('lat')
          || formatCoordinate(origin.lng) !== currentSearchParams.get('lng');

        setOrigin(origin);
        setLocationStatus('ready');
        setLocationMessage('Sorted by your current location.');

        if (originChanged) {
          replaceOriginInCurrentUrl(origin);
        }
      },
      () => {
        setOrigin(null);
        setLocationStatus('fallback');
        setLocationMessage('Location permission was unavailable, so results are sorted from the center of nearby venues.');

        if (window.location.search.includes('lat=') || window.location.search.includes('lng=')) {
          replaceOriginInCurrentUrl(null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  function toggleTag(tag: string) {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((activeTag) => activeTag !== tag)
      : [...selectedTags, tag];

    setSelectedTags(nextTags);
    replaceUrl({ tags: nextTags });
  }

  function clearFilters() {
    setSearch('');
    setSelectedTags([]);
    setHasEveningSun(false);
    replaceUrl({ query: '', tags: [], hasEveningSun: false });
  }

  return (
    <div className="rounded-[2rem] bg-white/90 p-4 shadow-soft">
      <div className="flex items-center gap-3 rounded-2xl border bg-muted px-4 py-3">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          aria-label="Search venues"
          className="h-auto border-0 bg-transparent px-0"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by venue or area"
          value={search}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <button
          aria-pressed={hasEveningSun}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors',
            hasEveningSun ? 'bg-secondary text-white shadow-soft' : 'bg-accent text-amber-900 hover:bg-amber-200'
          )}
          onClick={() => {
            const nextHasEveningSun = !hasEveningSun;

            setHasEveningSun(nextHasEveningSun);
            replaceUrl({ hasEveningSun: nextHasEveningSun });
          }}
          type="button"
        >
          <SunMedium className="h-4 w-4" />
          <span>Evening sun</span>
          {hasEveningSun && <X className="h-3.5 w-3.5" />}
        </button>
        {VENUE_TAG_SUGGESTIONS.map((tag) => {
          const isActive = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              aria-pressed={isActive}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors',
                isActive ? 'bg-slate-950 text-white shadow-soft' : 'bg-muted text-slate-700 hover:bg-white'
              )}
              onClick={() => toggleTag(tag)}
              type="button"
            >
              {tag}
              {isActive && <X className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2">
          {locationStatus === 'locating' || isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-secondary" />
          ) : (
            <LocateFixed className={cn('h-4 w-4', locationStatus === 'ready' ? 'text-secondary' : 'text-slate-400')} />
          )}
          <span>{locationMessage ?? 'Results are sorted from the center of nearby venues.'}</span>
        </div>
        <div className="inline-flex items-center gap-3">
          {hasActiveFilters && (
            <button
              className="text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-700"
              onClick={clearFilters}
              type="button"
            >
              Clear all
            </button>
          )}
          <span className="rounded-full bg-white px-3 py-2 font-medium text-slate-700">
            {resultCount} {resultCount === 1 ? 'spot' : 'spots'}
          </span>
        </div>
      </div>
    </div>
  );
}
