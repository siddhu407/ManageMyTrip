import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, Locate, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import type { AppLocation } from '@/types';

export function LocationSetupPage() {
  const navigate = useNavigate();
  const { setLocation, detectFromGPS } = useLocation();
  const [manualCity, setManualCity] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDetect = async () => {
    setError(null);
    setDetecting(true);
    setDetectedCity(null);

    const { error: detectError } = await detectFromGPS();

    if (detectError) {
      setError(detectError);
      setDetecting(false);
      return;
    }

    setDetecting(false);
    navigate('/onboarding');
  };

  const handleManual = async () => {
    if (!manualCity.trim()) return;
    setError(null);
    setSaving(true);

    const loc: AppLocation = {
      city: manualCity.trim(),
      source: 'manual',
    };
    await setLocation(loc);

    setSaving(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen surface-muted flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 mb-6">
          <MapPin className="h-7 w-7" />
        </div>

        <h1 className="font-display text-2xl font-bold text-default mb-2">
          Where are you exploring?
        </h1>
        <p className="text-muted mb-8">
          We'll use this to show you nearby places, activities, and local must-tries.
          You can change this anytime.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-900/15 border border-error-200 dark:border-error-900/30 px-4 py-3 mb-4 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
          </div>
        )}

        {detectedCity && !error && (
          <div className="flex items-start gap-2 rounded-xl bg-success-50 dark:bg-success-900/15 border border-success-200 dark:border-success-900/30 px-4 py-3 mb-4 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
            <p className="text-sm text-success-700 dark:text-success-400">
              Detected: {detectedCity}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="card p-5 w-full flex items-center gap-4 card-hover text-left disabled:opacity-60"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shrink-0">
              {detecting ? (
                <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Locate className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="font-semibold text-default">
                {detecting ? 'Detecting your location…' : 'Use my current location'}
              </p>
              <p className="text-sm text-muted">We'll detect your city automatically</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
            <span className="text-sm text-muted">or enter manually</span>
            <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
          </div>

          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                className="input-field pl-10"
                type="text"
                placeholder="Enter your city (e.g. Pune, Maharashtra)"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManual()}
              />
            </div>
            <button
              onClick={handleManual}
              disabled={!manualCity.trim() || saving}
              className="btn-secondary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Continue with this city
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          You can use the app without sharing your live location.
        </p>
      </div>
    </div>
  );
}

export default LocationSetupPage;
