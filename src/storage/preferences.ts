import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_REMINDERS_KEY = 'ya-pues:task-reminders:v1';

export async function loadTaskRemindersEnabled(): Promise<boolean> {
  const saved = await AsyncStorage.getItem(TASK_REMINDERS_KEY);
  if (saved === null) {
    return true;
  }
  return JSON.parse(saved);
}

export async function saveTaskRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(TASK_REMINDERS_KEY, JSON.stringify(enabled));
}

const DAILY_REMINDER_KEY = 'reminder';

export async function saveDailyReminder(reminder: { id: string; hour: number; minute: number }): Promise<void> {
  await AsyncStorage.setItem(DAILY_REMINDER_KEY, JSON.stringify(reminder));
}
