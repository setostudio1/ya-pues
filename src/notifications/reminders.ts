import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_VARIANTS, REMINDERS, SNOOZE_MINUTES } from '@/constants/reminders';
import type { ReminderResult, ReminderRoute } from '@/types/reminders';
import type { Task } from '@/types/tasks';

const CHANNEL_ID = 'task-reminders';
const DAILY_ID = 'daily-reminder';
const TEST_ID = 'test-reminder';
const MINUTE = 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function isReminderRoute(value: unknown): value is ReminderRoute {
  return REMINDER_VARIANTS.some((variant) => REMINDERS[variant].route === value);
}

export async function requestPermission(): Promise<ReminderResult> {
  if (Platform.OS === 'web') return 'unsupported';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de tareas',
      importance: AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'scheduled';
  if (!current.canAskAgain) return 'denied';

  const answer = await Notifications.requestPermissionsAsync();
  return answer.granted ? 'scheduled' : 'denied';
}

async function hasPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await Notifications.getPermissionsAsync()).granted;
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
  if (!(await hasPermission())) return;

  for (const variant of REMINDER_VARIANTS) {
    const { route, label, minutesBefore } = REMINDERS[variant];
    if (minutesBefore === undefined) continue;

    const time = taskDueTime(task) - minutesBefore * MINUTE;
    if (time > Date.now()) {
      await scheduleAt(reminderId(task.id, route), time, `${label}: ${task.title}`, { route, taskId: task.id });
    }
  }
}

export async function cancelTaskReminders(taskId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  for (const variant of REMINDER_VARIANTS) {
    await Notifications.cancelScheduledNotificationAsync(reminderId(taskId, REMINDERS[variant].route));
  }
}

export async function snoozeTaskReminder(task: Task): Promise<ReminderResult> {
  const permission = await requestPermission();
  if (permission !== 'scheduled') return permission;

  const { route, label } = REMINDERS.unstarted;
  await scheduleAt(reminderId(task.id, route), Date.now() + SNOOZE_MINUTES * MINUTE, `${label} ${task.title}`,
    { route, taskId: task.id });
  return 'scheduled';
}

export async function scheduleTestReminder(): Promise<ReminderResult> {
  const permission = await requestPermission();
  if (permission !== 'scheduled') return permission;

  await scheduleAt(TEST_ID, Date.now() + 10 * 1000, '¡YA PUES! Aviso de prueba', { route: REMINDERS.initial.route });
  return 'scheduled';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<ReminderResult> {
  const permission = await requestPermission();
  if (permission !== 'scheduled') return permission;

  await Notifications.cancelScheduledNotificationAsync(DAILY_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: { title: '¡Ya pues! Revisa tus tareas', body: 'Mira qué compromisos tienes pendientes hoy.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_ID },
  });
  return 'scheduled';
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID);
}
