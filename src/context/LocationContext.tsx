import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { AppLocation } from '@/types';

interface LocationContextValue {
  location: AppLocation | null;
  loading: boolean;
  setLocation: (loc: AppLocation) => Promise<void>;
  refreshLocation: () => Promise<void>;
  detectFromGPS: () => Promise<{ error: string | null }>;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

function reverseGeocode(lat: number, lng: number): Promise<{
  city: string;
  region?: string;
  country?: string;
  countryCode?: string;
} | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return fetch(
    `${supabaseUrl}/functions/v1/reverse-geocode?lat=${lat}&lng=${lng}`,
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      if (data.error) return null;
      return data as { city: string; region?: string; country?: string; countryCode?: string };
    })
    .catch(() => null);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { session, user } = useAuth();
  const [location, setLocationState] = useState<AppLocation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setLocationState(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('city, region, country, lat, lng, location_enabled')
      .eq('id', session.user.id)
      .maybeSingle();

    if (data?.city) {
      setLocationState({
        city: data.city,
        region: data.region ?? undefined,
        country: data.country ?? undefined,
        lat: data.lat ?? undefined,
        lng: data.lng ?? undefined,
        source: data.location_enabled ? 'gps' : 'manual',
      });
    } else {
      setLocationState(null);
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    loadFromProfile();
  }, [loadFromProfile]);

  const setLocation = useCallback(async (loc: AppLocation) => {
    if (!user?.id) return;
    setLocationState(loc);
    await supabase
      .from('profiles')
      .update({
        city: loc.city,
        region: loc.region ?? null,
        country: loc.country ?? null,
        lat: loc.lat ?? null,
        lng: loc.lng ?? null,
        location_enabled: loc.source === 'gps',
      })
      .eq('id', user.id);
  }, [user?.id]);

  const refreshLocation = useCallback(async () => {
    await loadFromProfile();
  }, [loadFromProfile]);

  const detectFromGPS = useCallback(async (): Promise<{ error: string | null }> => {
    if (!navigator.geolocation) {
      return { error: 'Geolocation is not supported by your browser. Please enter your city manually.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const geocoded = await reverseGeocode(latitude, longitude);

          if (!geocoded) {
            const loc: AppLocation = {
              city: 'Unknown location',
              lat: latitude,
              lng: longitude,
              source: 'gps',
            };
            await setLocation(loc);
            resolve({ error: null });
            return;
          }

          const loc: AppLocation = {
            city: geocoded.city,
            region: geocoded.region,
            country: geocoded.country,
            lat: latitude,
            lng: longitude,
            source: 'gps',
          };
          await setLocation(loc);
          resolve({ error: null });
        },
        (err) => {
          let message = 'Could not detect your location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission denied. You can enter your city manually instead.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable. Please enter your city manually.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Please try again or enter your city manually.';
          }
          resolve({ error: message });
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [setLocation]);

  return (
    <LocationContext.Provider value={{ location, loading, setLocation, refreshLocation, detectFromGPS }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
