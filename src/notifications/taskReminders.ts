import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_VARIANTS, REMINDERS, SNOOZE_MINUTES } from '@/constants/reminders';
import { askNotificationPermission } from '@/notifications/notifications';
import { loadTasks } from '@/storage/data';
import type { ReminderResult, ReminderRoute } from '@/types/reminders';
import type { Task } from '@/types/tasks';

const CHANNEL_ID = 'default';
const TEST_ID = 'test-reminder';
const MINUTE = 60 * 1000;

export function isReminderRoute(value: unknown): value is ReminderRoute {
  return REMINDER_VARIANTS.some((variant) => REMINDERS[variant].route === value);
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

function reminderId(taskId: string, route: ReminderRoute) {
  return `${taskId}${route}`;
}

function taskDueTime(task: Task) {
  return new Date(`${task.dueDate}T${task.dueTime}:00`).getTime();
}

async function scheduleAt(id: string, time: number, title: string, data: Record<string, string>) {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body: 'Toca para ver tu compromiso.', data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(time), channelId: CHANNEL_ID },
  });
}

export async function scheduleTaskReminders(task: Task): Promise<void> {
  if (!(await hasNotificationPermission())) {
    return;
  }

  for (const variant of REMINDER_VARIANTS) {
    const { route, label, minutesBefore } = REMINDERS[variant];
    if (minutesBefore === undefined) {
      continue;
    }

    const time = taskDueTime(task) - minutesBefore * MINUTE;
    if (time > Date.now()) {
      await scheduleAt(reminderId(task.id, route), time, `${label}: ${task.title}`, { route, taskId: task.id });
    }
  }
}

export async function scheduleSavedTaskReminders(taskId: string): Promise<void> {
  const task = (await loadTasks()).find((entry) => entry.id === taskId);
  if (task) {
    await scheduleTaskReminders(task);
  }
}

export async function cancelTaskReminders(taskId: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  for (const variant of REMINDER_VARIANTS) {
    await Notifications.cancelScheduledNotificationAsync(reminderId(taskId, REMINDERS[variant].route));
  }
}

export async function snoozeTaskReminder(task: Task): Promise<ReminderResult> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }
  if (!(await askNotificationPermission())) {
    return 'denied';
  }

  const { route, label } = REMINDERS.unstarted;
  await scheduleAt(reminderId(task.id, route), Date.now() + SNOOZE_MINUTES * MINUTE, `${label} ${task.title}`,
    { route, taskId: task.id });
  return 'scheduled';
}

export async function scheduleTestReminder(): Promise<ReminderResult> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }
  if (!(await askNotificationPermission())) {
    return 'denied';
  }

  await scheduleAt(TEST_ID, Date.now() + 10 * 1000, '¡YA PUES! Aviso de prueba', { route: REMINDERS.initial.route });
  return 'scheduled';
}
