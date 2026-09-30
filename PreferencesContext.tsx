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
import type { Interest, GroupType, TimeAvailable } from '@/types';

export interface UserPreferencesData {
  interests: Interest[];
  budget: number | null;
  group_type: GroupType | null;
  time_available: TimeAvailable | null;
  currency: string;
  onboarding_completed: boolean;
}

interface PreferencesContextValue {
  preferences: UserPreferencesData | null;
  loading: boolean;
  savePreferences: (data: Omit<UserPreferencesData, 'onboarding_completed'>) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferencesData = {
  interests: [],
  budget: null,
  group_type: null,
  time_available: null,
  currency: 'INR',
  onboarding_completed: false,
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferencesData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!session?.user?.id) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const [prefsResult, profileResult] = await Promise.all([
      supabase
        .from('user_preferences')
        .select('interests, budget, group_type, time_available, currency')
        .eq('user_id', session.user.id)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('onboarding_completed, currency')
        .eq('id', session.user.id)
        .maybeSingle(),
    ]);

    const prefs = prefsResult.data;
    const profile = profileResult.data;

    if (prefs) {
      setPreferences({
        interests: (prefs.interests ?? []) as Interest[],
        budget: prefs.budget,
        group_type: (prefs.group_type as GroupType) ?? null,
        time_available: (prefs.time_available as TimeAvailable) ?? null,
        currency: prefs.currency ?? profile?.currency ?? 'INR',
        onboarding_completed: profile?.onboarding_completed ?? false,
      });
    } else {
      setPreferences({
        ...DEFAULT_PREFERENCES,
        currency: profile?.currency ?? 'INR',
        onboarding_completed: profile?.onboarding_completed ?? false,
      });
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const savePreferences = useCallback(
    async (data: Omit<UserPreferencesData, 'onboarding_completed'>): Promise<{ error: string | null }> => {
      if (!session?.user?.id) {
        return { error: 'You must be logged in to save preferences.' };
      }

      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: session.user.id,
            interests: data.interests,
            budget: data.budget,
            group_type: data.group_type,
            time_available: data.time_available,
            currency: data.currency,
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) {
        return { error: 'Could not save your preferences. Please try again.' };
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true, currency: data.currency })
        .eq('id', session.user.id);

      if (profileError) {
        return { error: 'Could not complete onboarding. Please try again.' };
      }

      setPreferences({
        ...data,
        onboarding_completed: true,
      });

      return { error: null };
    },
    [session?.user?.id]
  );

  const refresh = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, loading, savePreferences, refresh }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
