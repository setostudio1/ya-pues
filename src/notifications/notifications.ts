import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type Reminder = {
  id: string;
  hour: number;
  minute: number;
};

const REMINDER_KEY = 'reminder';

export async function askNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      // eslint-disable-next-line import/namespace -- AndroidImportance is re-exported with `export *`.
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const answer = await Notifications.requestPermissionsAsync();
  return answer.granted;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<Reminder | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Ya pues! Hora de tus tareas',
      body: 'Revisa tus actividades pendientes del día.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const reminder = { id, hour, minute };
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(reminder));
  return reminder;
}

export async function loadReminder(): Promise<Reminder | null> {
  const saved = await AsyncStorage.getItem(REMINDER_KEY);
  if (saved === null) {
    return null;
  }
  return JSON.parse(saved);
}

export async function cancelReminder() {
  const reminder = await loadReminder();
  if (reminder !== null && Platform.OS !== 'web') {
    await Notifications.cancelScheduledNotificationAsync(reminder.id);
  }
  await AsyncStorage.removeItem(REMINDER_KEY);
}
