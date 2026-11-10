import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_VARIANTS, REMINDERS, SNOOZE_MINUTES } from '@/constants/reminders';
import { askNotificationPermission } from '@/notifications/notifications';
import { loadCompletions, loadTasks } from '@/storage/data';
import { loadTaskRemindersEnabled } from '@/storage/preferences';
import type { ReminderResult, ReminderRoute, ReminderVariant } from '@/types/reminders';
import type { Task, TaskCompletion } from '@/types/tasks';

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

async function canScheduleTaskReminders(): Promise<boolean> {
  return (await hasNotificationPermission()) && (await loadTaskRemindersEnabled());
}

function reminderId(taskId: string, variant: ReminderVariant) {
  return `${taskId}${REMINDERS[variant].route}`;
}

function taskDueTime(task: Task) {
  return new Date(`${task.dueDate}T${task.dueTime}:00`).getTime();
}

function reminderTime(task: Task, variant: ReminderVariant): number | null {
  const due = taskDueTime(task);
  let time = due - REMINDERS[variant].minutesBefore * MINUTE;
  if (variant === 'initial') {
    time = Math.max(time, Date.parse(task.createdAt) + MINUTE);
  }
  return time > Date.now() && time < due ? time : null;
}

async function scheduleAt(id: string, time: number, title: string, data: Record<string, string>) {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body: 'Toca para ver tu compromiso.', data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(time), channelId: CHANNEL_ID },
  });
}

async function scheduleMissingReminders(task: Task, pendingIds: Set<string>) {
  for (const variant of REMINDER_VARIANTS) {
    const id = reminderId(task.id, variant);
    const time = reminderTime(task, variant);
    if (time !== null && !pendingIds.has(id)) {
      const { route, label } = REMINDERS[variant];
      await scheduleAt(id, time, `${label}: ${task.title}`, { route, taskId: task.id });
    }
  }
}

export async function scheduleTaskReminders(task: Task): Promise<void> {
  if (await canScheduleTaskReminders()) {
    await scheduleMissingReminders(task, new Set());
  }
}

export async function scheduleSavedTaskReminders(taskId: string): Promise<void> {
  const task = (await loadTasks()).find((entry) => entry.id === taskId);
  if (task) {
    await scheduleTaskReminders(task);
  }
}

export async function syncTaskReminders(tasks: Task[], completions: TaskCompletion[]): Promise<void> {
  if (!(await canScheduleTaskReminders())) {
    return;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const pendingIds = new Set(scheduled.map((entry) => entry.identifier));
  const completedIds = new Set(completions.map((entry) => entry.taskId));
  for (const task of tasks) {
    if (!completedIds.has(task.id)) {
      await scheduleMissingReminders(task, pendingIds);
    }
  }
}

export async function syncSavedTaskReminders(userId?: string): Promise<void> {
  const [tasks, completions] = await Promise.all([loadTasks(userId), loadCompletions()]);
  await syncTaskReminders(tasks, completions);
}

export async function cancelTaskReminders(taskId: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  for (const variant of REMINDER_VARIANTS) {
    await Notifications.cancelScheduledNotificationAsync(reminderId(taskId, variant));
  }
}

export async function cancelAllTaskReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const entry of scheduled) {
    if (typeof entry.content.data?.taskId === 'string') {
      await Notifications.cancelScheduledNotificationAsync(entry.identifier);
    }
  }
}

export async function snoozeTaskReminder(task: Task): Promise<ReminderResult> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }
  if (!(await loadTaskRemindersEnabled())) {
    return 'disabled';
  }
  const fireAt = Date.now() + SNOOZE_MINUTES * MINUTE;
  if (fireAt >= taskDueTime(task)) {
    return 'tooLate';
  }
  if (!(await askNotificationPermission())) {
    return 'denied';
  }

  const { route, label } = REMINDERS.unstarted;
  await Notifications.cancelScheduledNotificationAsync(reminderId(task.id, 'initial'));
  await scheduleAt(reminderId(task.id, 'unstarted'), fireAt, `${label} ${task.title}`, { route, taskId: task.id });
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
