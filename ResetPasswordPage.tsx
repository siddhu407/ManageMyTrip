import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen surface-muted flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-default mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 mb-6">
          <Mail className="h-7 w-7" />
        </div>

        <h1 className="font-display text-2xl font-bold text-default mb-2">Reset your password</h1>
        <p className="text-muted mb-8">
          Enter your email and we'll send you a link to set a new password.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-error-50 dark:bg-error-900/15 border border-error-200 dark:border-error-900/30 px-4 py-3 mb-4 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
          </div>
        )}

        {sent ? (
          <div className="flex items-start gap-2 rounded-xl bg-success-50 dark:bg-success-900/15 border border-success-200 dark:border-success-900/30 px-4 py-3 mb-4 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success-700 dark:text-success-400">Check your email</p>
              <p className="text-sm text-success-600 dark:text-success-500 mt-0.5">
                We've sent a password reset link to {email}.
              </p>
            </div>
          </div>
        ) : (
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
            <button className="btn-primary w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
