import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  UtensilsCrossed,
  Coffee,
  Landmark,
  FerrisWheel,
  ShoppingBag,
  Trees,
  Palmtree,
  Footprints,
  CalendarDays,
  Camera,
  Moon,
  Star,
  MapPin,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { supabase } from '@/lib/supabase';

interface PlaceData {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  city: string;
  rating: number | null;
  price_level: number | null;
  open_now: boolean;
  is_open_now: boolean;
  distance_km: number | null;
  estimated_cost: number | null;
  description: string | null;
  tags: string[];
  emoji: string | null;
  is_famous: boolean;
}

const CATEGORIES = [
  { id: 'eat', label: 'Eat', icon: UtensilsCrossed },
  { id: 'cafe', label: 'Café', icon: Coffee },
  { id: 'explore', label: 'Explore', icon: Landmark },
  { id: 'entertainment', label: 'Entertainment', icon: FerrisWheel },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'nature', label: 'Nature', icon: Trees },
  { id: 'relax', label: 'Relax', icon: Palmtree },
  { id: 'adventure', label: 'Adventure', icon: Footprints },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera },
  { id: 'nightlife', label: 'Nightlife', icon: Moon },
];

const PRICE_FILTERS = [
  { id: 1, label: '₹ Budget' },
  { id: 2, label: '₹₹ Mid' },
  { id: 3, label: '₹₹₹ Premium' },
  { id: 4, label: '₹₹₹₹ Luxury' },
];

const SORT_OPTIONS = [
  { id: 'rating', label: 'Top rated' },
  { id: 'distance', label: 'Nearest' },
  { id: 'cost-low', label: 'Cost: low to high' },
  { id: 'cost-high', label: 'Cost: high to low' },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]['id'];

function formatCost(cost: number | null, priceLevel: number | null): string {
  if (cost && cost > 0) return `₹${cost} for two`;
  if (priceLevel === 1) return '₹ (budget)';
  if (priceLevel === 2) return '₹₹ (mid-range)';
  if (priceLevel === 3) return '₹₹₹ (premium)';
  if (priceLevel === 4) return '₹₹₹₹ (luxury)';
  return 'Price varies';
}

function formatDistance(km: number | null): string {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km} km`;
}

export function ExplorePage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory || null);
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortId>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('places')
      .select('id, name, category, subcategory, city, rating, price_level, open_now, is_open_now, distance_km, estimated_cost, description, tags, emoji, is_famous');

    if (location?.city) {
      query = query.eq('city', location.city);
    }

    if (activeCategory) {
      query = query.eq('category', activeCategory);
    }

    if (priceFilter) {
      query = query.eq('price_level', priceFilter);
    }

    if (openNowOnly) {
      query = query.eq('is_open_now', true);
    }

    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,tags.cs.{${searchQuery.trim()}}`);
    }

    const sortColumn = sortBy === 'distance' ? 'distance_km' : sortBy === 'rating' ? 'rating' : 'estimated_cost';
    const sortAscending = sortBy === 'cost-low' || sortBy === 'distance';
    query = query.order(sortColumn, { ascending: sortAscending, nullsFirst: false });

    const { data, error } = await query.limit(24);

    if (error) {
      setPlaces([]);
    } else {
      setPlaces((data ?? []) as PlaceData[]);
    }
    setLoading(false);
  }, [location?.city, activeCategory, priceFilter, openNowOnly, searchQuery, sortBy]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (activeCategory) params.category = activeCategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, setSearchParams]);

  const handleCategoryClick = (catId: string) => {
    setActiveCategory((prev) => (prev === catId ? null : catId));
  };

  const clearFilters = () => {
    setActiveCategory(null);
    setPriceFilter(null);
    setOpenNowOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = activeCategory || priceFilter || openNowOnly || searchQuery.trim();

  return (
    <div className="surface-muted min-h-full">
      {/* Header */}
      <div className="surface border-b border-default px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h1 className="font-display text-2xl font-bold text-default">
              Explore {location?.city ?? 'places'}
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              className="input-field pl-12 pr-10 py-3.5 text-base"
              placeholder="Search places, food, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-default"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    active
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-default surface text-default hover:border-ink-300 dark:hover:border-ink-600'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Filter bar */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-default transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">
                  {[activeCategory, priceFilter, openNowOnly, searchQuery.trim()].filter(Boolean).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-muted hover:text-default transition-colors"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="card p-4 mt-3 space-y-4 animate-fade-in">
              {/* Price */}
              <div>
                <p className="text-sm font-medium text-default mb-2">Price range</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_FILTERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriceFilter((prev) => (prev === p.id ? null : p.id))}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        priceFilter === p.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-default surface text-default hover:border-ink-300 dark:hover:border-ink-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open now */}
              <div>
                <p className="text-sm font-medium text-default mb-2">Availability</p>
                <button
                  onClick={() => setOpenNowOnly((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    openNowOnly
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-default surface text-default hover:border-ink-300 dark:hover:border-ink-600'
                  }`}
                >
                  <div className={`relative h-5 w-9 rounded-full transition-colors ${openNowOnly ? 'bg-primary-500' : 'bg-ink-300 dark:bg-ink-700'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${openNowOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  Open now only
                </button>
              </div>

              {/* Sort */}
              <div>
                <p className="text-sm font-medium text-default mb-2">Sort by</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        sortBy === opt.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-default surface text-default hover:border-ink-300 dark:hover:border-ink-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {loading
              ? 'Searching...'
              : `${places.length} ${places.length === 1 ? 'place' : 'places'} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-32 bg-ink-100 dark:bg-ink-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-3/4" />
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-full" />
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <div key={place.id} className="card overflow-hidden card-hover">
                <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/20 flex items-center justify-center text-5xl relative">
                  {place.emoji ?? '📍'}
                  {place.is_famous && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-ink-800/90 text-xs font-medium px-2 py-1 rounded-lg text-primary-600">
                      <Star className="h-3 w-3 fill-primary-500 text-primary-500" />
                      Famous
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-default">{place.name}</h3>
                    {place.rating && (
                      <span className="flex items-center gap-1 text-sm font-medium text-default shrink-0">
                        <Star className="h-3.5 w-3.5 text-secondary-500 fill-secondary-500" />
                        {place.rating}
                      </span>
                    )}
                  </div>
                  {place.subcategory && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">{place.subcategory}</p>
                  )}
                  <p className="text-sm text-muted mb-3 line-clamp-2">{place.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    {place.distance_km != null && <span>{formatDistance(place.distance_km)}</span>}
                    {place.distance_km != null && <span>·</span>}
                    <span>{formatCost(place.estimated_cost, place.price_level)}</span>
                    {place.is_open_now && (
                      <>
                        <span>·</span>
                        <span className="text-success-600 font-medium">Open now</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm flex-1 py-2">View</button>
                    <button className="btn-secondary text-sm py-2 px-3">Save</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MapPin className="h-10 w-10 text-muted mx-auto mb-3" />
            <h3 className="font-display font-bold text-default mb-1">No places found</h3>
            <p className="text-sm text-muted mb-4">
              {location?.city
                ? `No places match your filters in ${location.city}. Try adjusting your search.`
                : 'Set your city to find places near you.'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
