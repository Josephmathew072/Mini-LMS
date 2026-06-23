import { showToast } from '@/utils/showToast';
import * as Device from 'expo-device';
import type * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BOOKMARK_MILESTONE, INACTIVITY_HOURS, STORAGE_KEYS } from '../utils/constants';
import { asyncStorage } from './storage';

let NotificationsModule: typeof Notifications | null = null;
if (Platform.OS !== 'web') {
  NotificationsModule = require('expo-notifications') as typeof Notifications;
  NotificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  if (!NotificationsModule) {
    return false;
  }

  // Physical device check — simulators may not support all notification features
  if (Platform.OS === 'android') {
    await NotificationsModule.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: NotificationsModule.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }

  if (!Device.isDevice) {
    // Simulators still allow local notifications but log a note
    console.log('[Notifications] Running on simulator — local notifications may behave differently');
  }

  const { status: existing } = await NotificationsModule.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await NotificationsModule.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleLocalNotification(title: string, body: string): Promise<void> {
  console.log('Scheduling local notification:', title, body);
  if (Platform.OS === 'web') {
    showToast(title, body);
    return;
  }

  const granted = await requestNotificationPermission();
  if (!granted || !NotificationsModule) return;

  await NotificationsModule.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { timestamp: Date.now() },
    },
    trigger: {
      type: NotificationsModule.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
    }
  });
}

// Fire once when the user reaches 5+ bookmarks
export async function checkAndFireBookmarkMilestone(count: number): Promise<void> {
  if (count < BOOKMARK_MILESTONE) return;

  const alreadyFired = await asyncStorage.getItem<boolean>(STORAGE_KEYS.BOOKMARK_MILESTONE_DONE);
  if (alreadyFired) return;

  await scheduleLocalNotification(
    '📚 Great progress!',
    `You've saved ${count} courses. Ready to start learning?`,
  );
  await asyncStorage.setItem(STORAGE_KEYS.BOOKMARK_MILESTONE_DONE, true);
}

// Reset the milestone flag so it can fire again after more bookmarks
export async function resetBookmarkMilestone(): Promise<void> {
  await asyncStorage.removeItem(STORAGE_KEYS.BOOKMARK_MILESTONE_DONE);
}

// Called on every app open — checks if 24h have passed since last open
export async function handleInactivityReminder(): Promise<void> {
  const lastOpened = await asyncStorage.getItem<number>(STORAGE_KEYS.LAST_OPENED_AT);
  const now = Date.now();

  if (lastOpened !== null) {
    const hoursSince = (now - lastOpened) / (1000 * 60 * 60);
    if (hoursSince >= INACTIVITY_HOURS) {
      const alreadySent = await asyncStorage.getItem<boolean>(STORAGE_KEYS.INACTIVITY_REMINDER_SENT);
      if (!alreadySent) {
        await scheduleLocalNotification(
          '👋 Miss you!',
          'Continue your learning journey. Your courses are waiting.',
        );
        await asyncStorage.setItem(STORAGE_KEYS.INACTIVITY_REMINDER_SENT, true);
      }
    } else {
      // Came back within 24h — reset the flag
      await asyncStorage.setItem(STORAGE_KEYS.INACTIVITY_REMINDER_SENT, false);
    }
  }

  // Always update last opened time
  await asyncStorage.setItem(STORAGE_KEYS.LAST_OPENED_AT, now);
}
