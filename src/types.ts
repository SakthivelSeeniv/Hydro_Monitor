export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: string; // ISO string
}

export interface DailyHistory {
  date: string; // YYYY-MM-DD
  target: number; // in ml
  total: number; // in ml
  completed: boolean;
}

export interface ActivityLevel {
  id: 'sedentary' | 'active' | 'highly_active';
  label: string;
  multiplier: number; // factor of scaling water target
}

export interface OnboardingData {
  weight: number; // in kg
  weightUnit: 'kg' | 'lbs';
  activityLevel: 'sedentary' | 'active' | 'highly_active';
  gender: 'male' | 'female' | 'other';
  completed: boolean;
}

export interface AppSettings {
  dailyTarget: number; // in ml
  reminderFrequency: number; // in minutes (e.g., 30, 60, 120)
  startHour: string; // e.g., "08:00"
  endHour: string; // e.g., "22:00"
  maxNotificationsPerDay: number;
  customSoundName: string; // Sound file name or "Default Chime"
  customSoundData: string | null; // base64 URI or local URL
  onboarding: OnboardingData;
}

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionAmount?: number; // custom Quick log amount (e.g. 250)
}
