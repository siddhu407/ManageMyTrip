import {
  Home,
  Compass,
  Luggage,
  Wallet,
  User,
  Moon,
  Sun,
  Monitor,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeMode } from '@/types';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: Home, path: '/app/home' },
  { label: 'Explore', icon: Compass, path: '/app/explore' },
  { label: 'Trips', icon: Luggage, path: '/app/trips' },
  { label: 'Expenses', icon: Wallet, path: '/app/expenses' },
  { label: 'Profile', icon: User, path: '/app/profile' },
];

const THEME_OPTIONS: { mode: ThemeMode; icon: LucideIcon; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const current = THEME_OPTIONS.find((t) => t.mode === mode) ?? THEME_OPTIONS[2];
  const Icon = current.icon;
  const nextIndex = (THEME_OPTIONS.findIndex((t) => t.mode === mode) + 1) % THEME_OPTIONS.length;

  return (
    <button
      onClick={() => setMode(THEME_OPTIONS[nextIndex].mode)}
      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-muted hover:text-default hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
      title={`Theme: ${current.label} (click to switch)`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-default surface px-4 py-6">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none text-default">ManageMyTrip</p>
          <p className="text-2xs text-muted mt-0.5">Trip companion</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between px-2 pt-4 border-t border-default">
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>Settings</span>
        </NavLink>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 surface border-t border-default shadow-nav pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors min-w-[3.5rem] ${
                isActive
                  ? 'text-primary-600'
                  : 'text-muted hover:text-default'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-2xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-40 surface border-b border-default px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Compass className="h-4 w-4" />
        </div>
        <span className="font-display font-bold text-default">ManageMyTrip</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
