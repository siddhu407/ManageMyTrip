import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Bell, MapPin, Globe, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

const SETTINGS_SECTIONS = [
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', desc: 'Reservation reminders, weather alerts, budget warnings' },
      { icon: Globe, label: 'Currency', desc: 'Choose your preferred currency' },
      { icon: MapPin, label: 'Location', desc: 'Manage location access and default city' },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: Shield, label: 'Privacy', desc: 'Cookie preferences, data export, delete account' },
    ],
  },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { mode, setMode } = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="surface-muted min-h-full">
      <div className="surface border-b border-default px-6 py-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-default">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {/* Theme */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Appearance</h2>
          <div className="card p-4">
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => setMode(opt.mode)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    mode === opt.mode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-default hover:border-ink-300 dark:hover:border-ink-600'
                  }`}
                >
                  <opt.icon className={`h-5 w-5 ${mode === opt.mode ? 'text-primary-600' : 'text-muted'}`} />
                  <span className={`text-sm font-medium ${mode === opt.mode ? 'text-primary-700 dark:text-primary-400' : 'text-default'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Settings sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{section.title}</h2>
            <div className="card divide-y divide-ink-100 dark:divide-ink-800">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 text-muted shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-default">{item.label}</p>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Sign out */}
        <section>
          <button
            onClick={handleSignOut}
            className="card p-4 w-full flex items-center gap-4 hover:bg-error-50 dark:hover:bg-error-900/10 transition-colors text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-50 dark:bg-error-900/20 text-error-500 shrink-0">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-error-600 dark:text-error-400">Sign out</p>
              <p className="text-sm text-muted">Return to the welcome screen</p>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
