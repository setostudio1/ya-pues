import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadCompletions, loadTasks } from '../../storage/data';
import * as device from './notificationDevice';
import { createNotificationEngine } from './notificationEngine';
import { parsePreferences } from './notificationPlan';

const PREFERENCES_KEY = 'ya-pues:reminders:v1';

export const notificationService = createNotificationEngine({
  ...device, loadTasks, loadCompletions, now: Date.now,
  readPreferences: async () => parsePreferences(await AsyncStorage.getItem(PREFERENCES_KEY)),
  writePreferences: (preferences) => AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)),
});
