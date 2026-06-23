import { LocalNotifications } from '@capacitor/local-notifications';
import { AppSettings } from '../types';

export const setupLocalNotifications = async (settings: AppSettings) => {
  if (!settings.onboarding.completed) return;

  try {
    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') {
      console.warn('Local notifications permission denied');
      return;
    }

    // Cancel existing pending notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'WATER_LOG',
          actions: [
            {
              id: 'log_50',
              title: 'Drank 50ml',
              foreground: false
            }
          ]
        }
      ]
    });

    const [startH, startM] = settings.startHour.split(':').map(Number);
    const [endH, endM] = settings.endHour.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    if (endMinutes < startMinutes) endMinutes += 24 * 60; // handles overnight

    let currentMinutes = startMinutes;
    let id = 1;
    const notificationsToSchedule = [];

    while (currentMinutes <= endMinutes) {
      const h = Math.floor(currentMinutes / 60) % 24;
      const m = currentMinutes % 60;

      notificationsToSchedule.push({
        id: id++,
        title: '💧 HydroTrack Reminder',
        body: "Time for a glass of water to keep your metabolism active! 💧",
        schedule: {
          on: {
            hour: h,
            minute: m
          },
          allowWhileIdle: true
        },
        actionTypeId: 'WATER_LOG',
      });

      currentMinutes += settings.reminderFrequency;
      if (id > 50) break; // sanity limit
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
      console.log(`Scheduled ${notificationsToSchedule.length} daily local notifications.`);
    }

  } catch (error) {
    console.error('Failed to schedule local notifications', error);
  }
};
