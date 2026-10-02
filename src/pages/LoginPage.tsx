import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
      return;
    }

    navigate('/consent');
  };

  return (
    <div className="min-h-screen surface-muted flex">
      <div className="hidden md:flex md:w-1/2 bg-primary-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">ManageMyTrip</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-extrabold leading-tight mb-3">
            Welcome back.
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Pick up where you left off — your trips, saved places, and budget are waiting.
          </p>
        </div>
        <p className="text-primary-200 text-sm">
          Real places. Real budgets. Better decisions.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-default">ManageMyTrip</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-default mb-2">Log in</h1>
          <p className="text-muted mb-8">Good to have you back.</p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-900/15 border border-error-200 dark:border-error-900/30 px-4 py-3 mb-4 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
              <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-default mb-1.5">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-default">Password</label>
                <Link to="/reset-password" className="text-sm text-primary-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="input-field pr-10"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-default"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
            <span className="text-sm text-muted">or</span>
            <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
          </div>

          <button
            className="btn-secondary w-full flex items-center justify-center gap-2"
            type="button"
            onClick={() => setError('Google sign-in will be available once configured in Supabase.')}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted mt-6">
            New here?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
