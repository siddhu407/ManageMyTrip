import { Link, Navigate } from 'react-router-dom';
import { Compass, MapPin, Wallet, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const HERO_IMAGE =
  'https://images.pexels.com/photos/11357903/pexels-photo-11357903.jpeg?auto=compress&cs=tinysrgb&w=1600';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Know where you are',
    desc: 'Get recommendations based on your current location, time, and weather.',
  },
  {
    icon: CalendarDays,
    title: 'Plan every day',
    desc: 'Build itineraries that respect your budget, time, and interests.',
  },
  {
    icon: Wallet,
    title: 'Track every rupee',
    desc: 'Monitor trip expenses, split costs, and stay within budget.',
  },
];

export function WelcomePage() {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <div className="min-h-screen surface-muted">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Mountain highway through lush valleys"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

        <div className="relative h-full max-w-5xl mx-auto px-6 flex flex-col justify-end pb-12">
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
              <Compass className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-extrabold text-white tracking-tight">
              ManageMyTrip
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl animate-slide-up">
            Know where to go.
            <br />
            Know what to do.
            <br />
            Manage every trip.
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-slide-up">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-white/95 hover:bg-white text-ink-900 font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 card-hover">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-default mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-default surface py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-default">ManageMyTrip</span>
          </div>
          <p className="text-sm text-muted">
            Real places. Real budgets. Better decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
