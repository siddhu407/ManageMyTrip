import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, UtensilsCrossed, Landmark, FerrisWheel, ShoppingBag, Palmtree, CalendarDays, TrendingUp, Clock, MapPinOff, Star, ChevronRight } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { usePreferences } from '@/context/PreferencesContext';
import { supabase } from '@/lib/supabase';
import type { Interest } from '@/types';

interface PlaceData {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  rating: number | null;
  price_level: number | null;
  open_now: boolean;
  is_open_now: boolean;
  distance_km: number | null;
  estimated_cost: number | null;
  description: string | null;
  tags: string[];
  emoji: string | null;
}

interface FamousPlace {
  id: string;
  name: string;
  subcategory: string | null;
  description: string | null;
  tags: string[];
}

const QUICK_ACTIONS: { label: string; icon: typeof UtensilsCrossed; color: string; category: string }[] = [
  { label: 'Eat', icon: UtensilsCrossed, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20', category: 'eat' },
  { label: 'Explore', icon: Landmark, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20', category: 'explore' },
  { label: 'Activities', icon: FerrisWheel, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/20', category: 'entertainment' },
  { label: 'Shopping', icon: ShoppingBag, color: 'text-success-600 bg-success-50 dark:bg-success-900/20', category: 'shopping' },
  { label: 'Relax', icon: Palmtree, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20', category: 'relax' },
  { label: 'Events', icon: CalendarDays, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20', category: 'events' },
];

const INTEREST_TO_CATEGORY: Record<Interest, string[]> = {
  eat: ['eat'],
  cafe: ['cafe'],
  explore: ['explore', 'sightseeing'],
  entertainment: ['entertainment'],
  shopping: ['shopping'],
  nature: ['nature'],
  relax: ['relax', 'nature'],
  adventure: ['explore', 'adventure'],
  events: ['events'],
  sightseeing: ['sightseeing', 'explore'],
  nightlife: ['nightlife'],
  surprise: [],
};

function formatCost(cost: number | null, priceLevel: number | null): string {
  if (cost && cost > 0) {
    return `₹${cost} for two`;
  }
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

export function HomePage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { preferences } = usePreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<PlaceData[]>([]);
  const [famousPlaces, setFamousPlaces] = useState<FamousPlace[]>([]);
  const [nearNow, setNearNow] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);

  const cityName = location ? [location.city, location.region].filter(Boolean).join(', ') : 'Set your city';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const loadPlaces = useCallback(async () => {
    if (!location?.city) {
      setLoading(false);
      return;
    }

    const city = location.city;

    const [recResult, famousResult, nearResult] = await Promise.all([
      supabase
        .from('places')
        .select('id, name, category, subcategory, rating, price_level, open_now, is_open_now, distance_km, estimated_cost, description, tags, emoji')
        .eq('city', city)
        .order('rating', { ascending: false })
        .limit(6),
      supabase
        .from('places')
        .select('id, name, subcategory, description, tags')
        .eq('city', city)
        .eq('is_famous', true)
        .limit(3),
      supabase
        .from('places')
        .select('id, name, category, subcategory, rating, price_level, open_now, is_open_now, distance_km, estimated_cost, description, tags, emoji')
        .eq('city', city)
        .eq('is_open_now', true)
        .order('distance_km', { ascending: true })
        .limit(4),
    ]);

    let recs = (recResult.data ?? []) as PlaceData[];

    if (preferences?.interests && preferences.interests.length > 0) {
      const preferredCategories = new Set<string>();
      preferences.interests.forEach((interest: Interest) => {
        INTEREST_TO_CATEGORY[interest]?.forEach((cat: string) => preferredCategories.add(cat));
      });

      if (preferredCategories.size > 0) {
        const matched = recs.filter((p) => preferredCategories.has(p.category));
        const others = recs.filter((p) => !preferredCategories.has(p.category));
        recs = [...matched, ...others].slice(0, 6);
      }
    }

    setRecommendations(recs);
    setFamousPlaces((famousResult.data ?? []) as FamousPlace[]);
    setNearNow((nearResult.data ?? []) as PlaceData[]);
    setLoading(false);
  }, [location?.city, preferences?.interests]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleQuickAction = (category: string) => {
    navigate(`/app/explore?category=${category}`);
  };

  return (
    <div className="surface-muted min-h-full">
      {/* Greeting + location */}
      <div className="surface border-b border-default px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-default">
                {greeting},
              </h1>
              <div className="flex items-center gap-1.5 text-muted mt-1">
                {location ? (
                  <MapPin className="h-4 w-4 text-primary-500" />
                ) : (
                  <MapPinOff className="h-4 w-4 text-muted" />
                )}
                <span className="text-sm">Currently in {cityName}</span>
                {!location && (
                  <button
                    onClick={() => navigate('/location')}
                    className="text-sm text-primary-600 font-medium hover:underline ml-1"
                  >
                    Set it
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4" />
              <span>
                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} —{' '}
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              className="input-field pl-12 py-3.5 text-base"
              placeholder="What do you want to do? (e.g. 'Best pizza under ₹500 near me')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.category)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl surface border border-default hover:border-ink-300 dark:hover:border-ink-600 transition-colors"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-default">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-10">
        {/* Recommended for you */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <h2 className="font-display text-xl font-bold text-default">Recommended for You</h2>
          </div>
          <p className="text-sm text-muted mb-5">
            Based on your location, budget, and what you want to do right now.
          </p>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
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
          ) : recommendations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => {
                const costLabel = formatCost(rec.estimated_cost, rec.price_level);
                const distLabel = formatDistance(rec.distance_km);
                return (
                <div key={rec.id} className="card overflow-hidden card-hover">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/20 flex items-center justify-center text-5xl">
                    {rec.emoji ?? '📍'}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-default">{rec.name}</h3>
                      {rec.rating && (
                        <span className="flex items-center gap-1 text-sm font-medium text-default shrink-0">
                          <Star className="h-3.5 w-3.5 text-secondary-500 fill-secondary-500" />
                          {rec.rating}
                        </span>
                      )}
                    </div>
                    {rec.subcategory && (
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">{rec.subcategory}</p>
                    )}
                    <p className="text-sm text-muted mb-3 line-clamp-2">{rec.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mb-3">
                      {distLabel && <span>{distLabel}</span>}
                      {distLabel && <span>·</span>}
                      <span>{costLabel}</span>
                      {rec.is_open_now && (
                        <>
                          <span>·</span>
                          <span className="text-success-600 font-medium">Open now</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/app/explore?place=${rec.id}`)}
                        className="btn-primary text-sm flex-1 py-2"
                      >
                        View
                      </button>
                      <button className="btn-secondary text-sm py-2 px-3">Save</button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-muted">
                {location?.city
                  ? `No recommendations found for ${location.city} yet. Try exploring all places.`
                  : 'Set your city to get personalized recommendations.'}
              </p>
              {location?.city && (
                <button
                  onClick={() => navigate('/app/explore')}
                  className="btn-secondary mt-3 text-sm"
                >
                  Browse all places
                </button>
              )}
            </div>
          )}
        </section>

        {/* What's famous here */}
        {famousPlaces.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="h-5 w-5 text-secondary-500" />
              <h2 className="font-display text-xl font-bold text-default">
                You Shouldn't Leave {location?.city ?? 'Your City'} Without Trying These
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {famousPlaces.map((item) => (
                <div key={item.id} className="card p-4 card-hover">
                  {item.subcategory && (
                    <span className="text-2xs font-medium text-primary-600 uppercase tracking-wide">
                      {item.subcategory}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-default mt-1 mb-1">{item.name}</h3>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Near me right now */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-accent-500" />
            <h2 className="font-display text-xl font-bold text-default">Near Me Right Now</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            It's {timeOfDay} — here's what's open and worth your time.
          </p>
          {loading ? (
            <div className="card p-6 text-center">
              <div className="h-6 w-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto" />
            </div>
          ) : nearNow.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {nearNow.map((place) => {
                const nearDist = formatDistance(place.distance_km);
                const nearCost = formatCost(place.estimated_cost, null);
                return (
                <div key={place.id} className="card p-4 flex items-center gap-4 card-hover">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/20 text-3xl shrink-0">
                    {place.emoji ?? '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-default truncate">{place.name}</h3>
                      {place.rating && (
                        <span className="flex items-center gap-1 text-sm font-medium text-default shrink-0">
                          <Star className="h-3.5 w-3.5 text-secondary-500 fill-secondary-500" />
                          {place.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {nearDist && <span>{nearDist}</span>}
                      {nearDist && nearCost && <span>·</span>}
                      {nearCost && <span>{nearCost}</span>}
                      <span>·</span>
                      <span className="text-success-600 font-medium">Open now</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted shrink-0" />
                </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-muted">
                {location?.city
                  ? `Nothing open right now in ${location.city}. Check back later or explore all places.`
                  : 'Set your city to see what\'s open near you right now.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
