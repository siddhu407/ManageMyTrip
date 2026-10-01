import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Cookie, Bell, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ConsentPreferences {
  location: boolean;
  cookies: boolean;
  notifications: boolean;
}

const CONSENT_ITEMS: {
  icon: typeof MapPin;
  title: string;
  desc: string;
  required: boolean;
  key: keyof ConsentPreferences;
}[] = [
  {
    icon: MapPin,
    title: 'Location',
    desc: "Used to show places and activities near you. We don't store your precise location history.",
    required: false,
    key: 'location',
  },
  {
    icon: Cookie,
    title: 'Cookies & local storage',
    desc: 'Used to remember your session, theme, and preferences across visits.',
    required: true,
    key: 'cookies',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Optional alerts for reservations, weather changes, and budget warnings.',
    required: false,
    key: 'notifications',
  },
];

export function ConsentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    location: true,
    cookies: true,
    notifications: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: keyof ConsentPreferences) => {
    if (key === 'cookies') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAccept = async () => {
    setSaving(true);
    setError(null);

    if (user?.id) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_prefs: {
            location_consent: preferences.location,
            cookie_consent: true,
            notifications_consent: preferences.notifications,
          },
        })
        .eq('id', user.id);

      if (updateError) {
        setError('Could not save your preferences. Please try again.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate('/location');
  };

  const handleReject = async () => {
    setSaving(true);
    setError(null);

    if (user?.id) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_prefs: {
            location_consent: false,
            cookie_consent: true,
            notifications_consent: false,
          },
        })
        .eq('id', user.id);

      if (updateError) {
        setError('Could not save your preferences. Please try again.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    navigate('/location');
  };

  return (
    <div className="min-h-screen surface-muted flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-default">Privacy & Cookie Consent</h1>
            <p className="text-sm text-muted">You're in control of your data.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-900/15 border border-error-200 dark:border-error-900/30 px-4 py-3 mb-4 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {CONSENT_ITEMS.map((item) => (
            <div key={item.title} className="card p-4 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 text-muted shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-default">{item.title}</h3>
                  {item.required && (
                    <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-muted">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
              {!item.required && (
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                    preferences[item.key]
                      ? 'bg-primary-500'
                      : 'bg-ink-300 dark:bg-ink-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      preferences[item.key]
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              )}
              {item.required && (
                <div className="flex h-6 w-11 items-center justify-center bg-primary-500 rounded-full">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card p-4 mb-6 bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30">
          <p className="text-sm text-default leading-relaxed">
            <strong>ManageMyTrip uses your location</strong> to show places and activities near you.
            You can change this anytime in Settings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Accept & Continue
              </>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={saving}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Reject non-essential
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentPage;
