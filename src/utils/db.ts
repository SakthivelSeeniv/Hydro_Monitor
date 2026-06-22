import { WaterLog, DailyHistory, AppSettings, OnboardingData } from '../types';

const STORAGE_KEYS = {
  LOGS: 'hydrotrack_logs',
  SETTINGS: 'hydrotrack_settings',
  HISTORY: 'hydrotrack_history',
  STREAK: 'hydrotrack_streak',
  LAST_OPENED_DATE: 'hydrotrack_last_opened_date', // format: YYYY-MM-DD
};

// Default setup values
export const DEFAULT_SETTINGS: AppSettings = {
  dailyTarget: 2000,
  reminderFrequency: 60, // 1 hour
  startHour: '08:00',
  endHour: '22:00',
  maxNotificationsPerDay: 10,
  customSoundName: 'Bubbles Splash',
  customSoundData: null,
  onboarding: {
    weight: 70,
    weightUnit: 'kg',
    activityLevel: 'active',
    gender: 'female',
    completed: false,
  },
};

export function getTodayDateString(simulatedDate?: Date): string {
  const date = simulatedDate || new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Convert lbs to kg if needed
export function calculateWaterGoal(weight: number, unit: 'kg' | 'lbs', activityLevel: 'sedentary' | 'active' | 'highly_active'): number {
  const weightKg = unit === 'lbs' ? weight / 2.20462 : weight;
  // Rule: 35ml per kg of body weight
  let target = Math.round(weightKg * 35);

  // Activity level offsets
  if (activityLevel === 'active') {
    target += 500;
  } else if (activityLevel === 'highly_active') {
    target += 1000;
  }

  // Bracket it between 1000ml and 5000ml to stay healthy
  return Math.min(Math.max(target, 1200), 5000);
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure nested fields
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadLogs(): WaterLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return [];
}

export function saveLogs(logs: WaterLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function loadHistory(): DailyHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveHistory(history: DailyHistory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (raw) {
      return parseInt(raw, 10) || 0;
    }
  } catch (e) {
    console.error('Failed to load streak', e);
  }
  return 0;
}

export function saveStreak(streak: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
  } catch (e) {
    console.error('Failed to save streak', e);
  }
}

// Resets water level to 0 at midnight of next day
// and archives previous days into History
export function checkDailyReset(simulatedDate?: Date): { resetOccurred: boolean; loggedAmount: number } {
  const todayStr = getTodayDateString(simulatedDate);
  const lastOpened = localStorage.getItem(STORAGE_KEYS.LAST_OPENED_DATE);

  let resetOccurred = false;
  let loggedAmount = 0;

  if (lastOpened && lastOpened !== todayStr) {
    // Midnight reset occurred!
    resetOccurred = true;

    // Load active settings
    const settings = loadSettings();
    const logs = loadLogs();

    // Sum up the last day's consumption (excluding today)
    const lastDayLogs = logs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      return logDate === lastOpened;
    });

    const totalLastDay = lastDayLogs.reduce((sum, log) => sum + log.amount, 0);
    const targetLastDay = settings.dailyTarget;
    const completedLastDay = totalLastDay >= targetLastDay;

    // Archive last day in history
    const history = loadHistory();
    // Check if entry already exists to avoid duplication
    if (!history.some(h => h.date === lastOpened)) {
      history.push({
        date: lastOpened,
        target: targetLastDay,
        total: totalLastDay,
        completed: completedLastDay,
      });
      saveHistory(history);
    }

    // Now recalculate streak!
    let currentStreak = loadStreak();
    if (completedLastDay) {
      // Check if it's consecutive
      const yesterday = new Date(todayStr);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getTodayDateString(yesterday);

      // Verify that the day before yesterday was either completed or streak is safe
      // For simplicity, consecutive means did yesterday complete?
      // Since yesterday completed, we increment streak if streak is active, or set to 1
      if (currentStreak === 0) {
        currentStreak = 1;
      } else {
        currentStreak += 1;
      }
    } else {
      // If we missed a day, reset streak to zero
      currentStreak = 0;
    }
    saveStreak(currentStreak);

    // Save current opened date
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_DATE, todayStr);
  } else if (!lastOpened) {
    // First time initializing
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_DATE, todayStr);
  }

  // Calculate today's current logs total
  const logs = loadLogs();
  const todayLogs = logs.filter(log => log.timestamp.split('T')[0] === todayStr);
  loggedAmount = todayLogs.reduce((sum, log) => sum + log.amount, 0);

  return { resetOccurred, loggedAmount };
}

// Generate default mock logs for the previous 7 days so statistics are beautifully populated right away!
export function populateMockAnalyticsIfEmpty(): void {
  const logs = loadLogs();
  const history = loadHistory();

  if (history.length === 0 && logs.length === 0) {
    const today = new Date();
    const settings = loadSettings();
    const mockHistory: DailyHistory[] = [];
    const mockLogs: WaterLog[] = [];

    // Let's create history for previous 7 days (index 1 to 7)
    for (let i = 7; i >= 1; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getTodayDateString(d);

      // Random completion (mostly successful of targets 2000)
      const isCompleted = Math.random() > 0.3;
      const totalAmount = isCompleted
        ? Math.round((settings.dailyTarget + (Math.random() * 400 - 100)) / 50) * 50
        : Math.round((settings.dailyTarget * 0.6 + (Math.random() * 300)) / 50) * 50;

      mockHistory.push({
        date: dateStr,
        target: settings.dailyTarget,
        total: totalAmount,
        completed: totalAmount >= settings.dailyTarget,
      });

      // Split total amount into 3-4 log entries
      let remaining = totalAmount;
      let count = 0;
      while (remaining > 0 && count < 6) {
        const amount = Math.min(remaining, Math.random() > 0.5 ? 500 : 250);
        d.setHours(8 + count * 2, Math.floor(Math.random() * 60), 0);
        mockLogs.push({
          id: `mock-${dateStr}-${count}`,
          amount,
          timestamp: d.toISOString(),
        });
        remaining -= amount;
        count++;
      }
    }

    saveHistory(mockHistory);
    saveLogs(mockLogs);
    // Set starter streak
    saveStreak(4);
  }
}
