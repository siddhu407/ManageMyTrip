import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
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
  Sparkles,
  Users,
  Clock,
  Wallet,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Interest, GroupType, TimeAvailable } from '@/types';
import { useLocation } from '@/context/LocationContext';
import { usePreferences } from '@/context/PreferencesContext';

const INTERESTS: { id: Interest; label: string; icon: typeof UtensilsCrossed }[] = [
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
  { id: 'surprise', label: 'Surprise Me', icon: Sparkles },
];

const GROUPS: { id: GroupType; label: string }[] = [
  { id: 'solo', label: 'Solo' },
  { id: 'partner', label: 'Partner' },
  { id: 'friends', label: 'Friends' },
  { id: 'family', label: 'Family' },
  { id: 'kids', label: 'Kids' },
  { id: 'group', label: 'Group' },
];

const TIMES: { id: TimeAvailable; label: string }[] = [
  { id: '1h', label: '1 hour' },
  { id: '2-3h', label: '2–3 hours' },
  { id: 'half-day', label: 'Half day' },
  { id: 'full-day', label: 'Full day' },
  { id: 'multi-day', label: 'Multiple days' },
];

const BUDGETS = [
  { label: 'No budget', value: 0 },
  { label: '₹0–₹500', value: 500 },
  { label: '₹500–₹1,000', value: 1000 },
  { label: '₹1,000–₹2,500', value: 2500 },
  { label: '₹2,500–₹5,000', value: 5000 },
  { label: '₹5,000+', value: 5001 },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { preferences, loading: prefsLoading, savePreferences } = usePreferences();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [group, setGroup] = useState<GroupType | null>(null);
  const [time, setTime] = useState<TimeAvailable | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (prefsLoading) {
    return (
      <div className="min-h-screen surface-muted flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (preferences?.onboarding_completed) {
    return <Navigate to="/app/home" replace />;
  }

  const toggleInterest = (id: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);

    const { error: saveError } = await savePreferences({
      interests: selectedInterests,
      budget: budget === 0 ? null : budget,
      group_type: group,
      time_available: time,
      currency: 'INR',
    });

    if (saveError) {
      setError(saveError);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate('/app/home');
  };

  const steps = [
    {
      title: 'What do you want to do right now?',
      subtitle: location
        ? `Exploring ${location.city}${location.region ? ', ' + location.region : ''}. Pick as many as you like — we'll tailor recommendations to these.`
        : "Pick as many as you like — we'll tailor recommendations to these.",
      content: (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {INTERESTS.map((interest) => {
            const active = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  active
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-default surface hover:border-ink-300 dark:hover:border-ink-600'
                }`}
              >
                <interest.icon className={`h-6 w-6 ${active ? 'text-primary-600' : 'text-muted'}`} />
                <span className={`text-sm font-medium ${active ? 'text-primary-700 dark:text-primary-400' : 'text-default'}`}>
                  {interest.label}
                </span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: selectedInterests.length > 0,
    },
    {
      title: 'What is your approximate budget?',
      subtitle: 'This helps us filter places that fit what you want to spend. Optional — skip if you prefer.',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BUDGETS.map((b) => (
            <button
              key={b.label}
              onClick={() => setBudget(b.value)}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                budget === b.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-default surface hover:border-ink-300 dark:hover:border-ink-600'
              }`}
            >
              {budget === b.value && <Check className="h-4 w-4 text-primary-600" />}
              <span className={`text-sm font-medium ${budget === b.value ? 'text-primary-700 dark:text-primary-400' : 'text-default'}`}>
                {b.label}
              </span>
            </button>
          ))}
        </div>
      ),
      canProceed: true,
    },
    {
      title: 'Who are you travelling with?',
      subtitle: "We'll adjust recommendations for your group.",
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                group === g.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-default surface hover:border-ink-300 dark:hover:border-ink-600'
              }`}
            >
              <Users className={`h-5 w-5 ${group === g.id ? 'text-primary-600' : 'text-muted'}`} />
              <span className={`text-sm font-medium ${group === g.id ? 'text-primary-700 dark:text-primary-400' : 'text-default'}`}>
                {g.label}
              </span>
            </button>
          ))}
        </div>
      ),
      canProceed: group !== null,
    },
    {
      title: 'How much time do you have?',
      subtitle: 'This helps us suggest activities that fit your schedule.',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTime(t.id)}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                time === t.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-default surface hover:border-ink-300 dark:hover:border-ink-600'
              }`}
            >
              <Clock className={`h-5 w-5 ${time === t.id ? 'text-primary-600' : 'text-muted'}`} />
              <span className={`text-sm font-medium ${time === t.id ? 'text-primary-700 dark:text-primary-400' : 'text-default'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      ),
      canProceed: time !== null,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen surface-muted flex flex-col">
      {/* Progress bar */}
      <div className="surface border-b border-default px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-ink-200 dark:bg-ink-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-900/15 border border-error-200 dark:border-error-900/30 px-4 py-3 mb-6 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
              <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <p className="text-sm text-muted mb-2">Step {step + 1} of {steps.length}</p>
            <h1 className="font-display text-2xl font-bold text-default mb-2">{current.title}</h1>
            <p className="text-muted">{current.subtitle}</p>
          </div>

          {current.content}

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary"
                disabled={saving}
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => (isLast ? handleComplete() : setStep((s) => s + 1))}
              disabled={!current.canProceed || saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : isLast ? (
                <>
                  <Check className="h-4 w-4" />
                  Start exploring
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {step === 1 && (
            <p className="text-center text-sm text-muted mt-4">
              <Wallet className="inline h-4 w-4 mr-1" />
              You can always change or set a budget later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
