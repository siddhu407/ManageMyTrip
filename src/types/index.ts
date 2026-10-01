export type ThemeMode = 'light' | 'dark' | 'system';

export type Interest =
  | 'eat'
  | 'cafe'
  | 'explore'
  | 'entertainment'
  | 'shopping'
  | 'nature'
  | 'relax'
  | 'adventure'
  | 'events'
  | 'sightseeing'
  | 'nightlife'
  | 'surprise';

export type GroupType = 'solo' | 'partner' | 'friends' | 'family' | 'kids' | 'group';

export type TimeAvailable = '1h' | '2-3h' | 'half-day' | 'full-day' | 'multi-day';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'hotel'
  | 'activity'
  | 'shopping'
  | 'tickets'
  | 'other';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

export interface Place {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  openNow?: boolean;
  openingHours?: string;
  distance?: number;
  estimatedCost?: number;
  description?: string;
  tags?: string[];
  photoUrl?: string;
}

export interface Trip {
  id: string;
  owner_id: string;
  title: string;
  city: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  status: 'planning' | 'active' | 'completed';
}

export interface Expense {
  id: string;
  trip_id: string;
  paid_by_user_id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  receipt_url?: string;
  split_type: 'personal' | 'shared';
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string;
  time: string;
  place_name: string;
  category: string;
  lat?: number;
  lng?: number;
  est_cost?: number;
  duration_min?: number;
  sort_order: number;
}

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  price_level?: number;
  list_name: string;
}

export interface UserPreferences {
  interests: Interest[];
  budget?: number;
  group_type?: GroupType;
  time_available?: TimeAvailable;
  currency: string;
}

export interface AppLocation {
  city: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  source: 'gps' | 'manual';
}
