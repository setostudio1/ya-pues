import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_VARIANTS, REMINDERS, SNOOZE_MINUTES } from '@/constants/reminders';
import { askNotificationPermission } from '@/notifications/notifications';
import {
  cancelWebNotification, cancelWebTaskNotifications, getWebNotificationIds, scheduleWebNotification,
} from '@/notifications/webReminders';
import { loadCompletions, loadTasks } from '@/storage/data';
import { loadTaskRemindersEnabled } from '@/storage/preferences';
import type { ReminderResult, ReminderRoute, ReminderVariant } from '@/types/reminders';
import type { Task, TaskCompletion } from '@/types/tasks';
import { advanceReminderTime, taskDueTime } from '@/utils/tasks';

const CHANNEL_ID = 'default';
const TEST_ID = 'test-reminder';
const MINUTE = 60 * 1000;
const TASK_NOTICE_IDS = ['due', 'advance'] as const;
let reminderQueue: Promise<unknown> = Promise.resolve();

function enqueueReminderChange<T>(change: () => Promise<T>): Promise<T> {
  const result = reminderQueue.then(change);
  reminderQueue = result.catch(() => undefined);
  return result;
}

export function isReminderRoute(value: unknown): value is ReminderRoute {
  return REMINDER_VARIANTS.some((variant) => REMINDERS[variant].route === value);
}

const isWeb = Platform.OS === 'web';

export async function hasNotificationPermission(): Promise<boolean> {
  if (isWeb) {
    return true;
  }
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) return false;
  if (Platform.OS !== 'android') return true;
  const channel = await Notifications.getNotificationChannelAsync(CHANNEL_ID);
  // eslint-disable-next-line import/namespace -- AndroidImportance is re-exported with `export *`.
  return channel?.importance !== Notifications.AndroidImportance.NONE;
}

export async function requestReminderPermission(): Promise<boolean> {
  return isWeb || ((await askNotificationPermission()) && (await hasNotificationPermission()));
}

export async function taskReminderAvailability(): Promise<'enabled' | 'disabled' | 'denied'> {
  if (!(await loadTaskRemindersEnabled())) return 'disabled';
  return (await hasNotificationPermission()) ? 'enabled' : 'denied';
}

export async function hasExactReminderPermission(): Promise<boolean> {
  return Platform.OS !== 'android' || (await Notifications.getExactAlarmPermissionsAsync()).granted;
}

export async function requestExactReminderPermission(): Promise<void> {
  if (Platform.OS === 'android') await Notifications.requestExactAlarmPermissionsAsync();
}

function reminderId(taskId: string, variant: ReminderVariant) {
  return `${taskId}${REMINDERS[variant].route}`;
}

function reminderTime(task: Task, variant: ReminderVariant): number | null {
  const due = taskDueTime(task);
  let time = due - REMINDERS[variant].minutesBefore * MINUTE;
  if (variant === 'initial') {
    time = Math.max(time, Date.parse(task.createdAt) + MINUTE);
  }
  return time > Date.now() && time < due ? time : null;
}

type ReminderData = { route: ReminderRoute; taskId?: string };

async function scheduleAt(id: string, time: number, title: string, variant: ReminderVariant, data: ReminderData) {
  if (isWeb) {
    scheduleWebNotification(time, { id, kind: variant, title, body: 'Toca para ver tu compromiso.', ...data });
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body: 'Toca para ver tu compromiso.', data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(time), channelId: CHANNEL_ID },
  });
}

async function cancelById(id: string) {
  if (isWeb) cancelWebNotification(id);
  else await Notifications.cancelScheduledNotificationAsync(id);
}

async function pendingReminderIds(): Promise<Set<string>> {
  if (isWeb) {
    return getWebNotificationIds();
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return new Set(scheduled.map((entry) => entry.identifier));
}

async function scheduleMissingReminders(task: Task, pendingIds: Set<string>) {
  if (task.advanceReminder !== undefined) {
    const times = { due: taskDueTime(task), advance: advanceReminderTime(task) };
    for (const notice of TASK_NOTICE_IDS) {
      const id = `${task.id}/${notice}`;
      const time = times[notice];
      if (time === undefined || !(time > Date.now()) || pendingIds.has(id)) continue;
      const variant = notice === 'due' ? 'personal' : 'initial';
      const label = notice === 'due' ? 'Hora límite' : 'Aviso anticipado';
      await scheduleAt(id, time, `${label}: ${task.title}`, variant, {
        route: REMINDERS[variant].route, taskId: task.id,
      });
    }
    return;
  }
  for (const variant of REMINDER_VARIANTS) {
    const id = reminderId(task.id, variant);
    const time = reminderTime(task, variant);
    if (time !== null && !pendingIds.has(id)) {
      const { route, label } = REMINDERS[variant];
      await scheduleAt(id, time, `${label}: ${task.title}`, variant, { route, taskId: task.id });
    }
  }
}

export function scheduleTaskReminders(task: Task, { replace = false } = {}): Promise<void> {
  return enqueueReminderChange(async () => {
    if (replace) await cancelTaskReminderIds(task.id);
    if ((await taskReminderAvailability()) === 'enabled') {
      await scheduleMissingReminders(task, await pendingReminderIds());
    }
  });
}

export async function scheduleSavedTaskReminders(taskId: string): Promise<void> {
  await enqueueReminderChange(async () => {
    if ((await taskReminderAvailability()) !== 'enabled') return;
    const [tasks, completions] = await Promise.all([loadTasks(), loadCompletions()]);
    const task = tasks.find((entry) => entry.id === taskId);
    if (task && !completions.some((entry) => entry.taskId === taskId)) {
      await scheduleMissingReminders(task, await pendingReminderIds());
    }
  });
}

export async function syncTaskReminders(tasks: Task[], completions: TaskCompletion[]): Promise<void> {
  await enqueueReminderChange(async () => {
    if ((await taskReminderAvailability()) !== 'enabled') return;
    const pendingIds = await pendingReminderIds();
    const visibleIds = new Set(tasks.map((task) => task.id));
    const [savedTasks, savedCompletions] = await Promise.all([loadTasks(), loadCompletions()]);
    const completedIds = new Set([...completions, ...savedCompletions].map((entry) => entry.taskId));
    for (const task of savedTasks) {
      if (visibleIds.has(task.id) && !completedIds.has(task.id)) {
        await scheduleMissingReminders(task, pendingIds);
      }
    }
  });
}

export async function syncSavedTaskReminders(userId?: string): Promise<void> {
  const [tasks, completions] = await Promise.all([loadTasks(userId), loadCompletions()]);
  await syncTaskReminders(tasks, completions);
}

async function cancelTaskReminderIds(taskId: string): Promise<void> {
  const ids = [
    ...REMINDER_VARIANTS.map((variant) => reminderId(taskId, variant)),
    ...TASK_NOTICE_IDS.map((notice) => `${taskId}/${notice}`),
  ];
  const results = await Promise.allSettled(ids.map(cancelById));
  const failure = results.find((result) => result.status === 'rejected');
  if (failure) throw failure.reason;
}

export function cancelTaskReminders(taskId: string): Promise<void> {
  return enqueueReminderChange(() => cancelTaskReminderIds(taskId));
}

export function cancelAllTaskReminders(): Promise<void> {
  return enqueueReminderChange(cancelAllTaskReminderIds);
}

async function cancelAllTaskReminderIds(): Promise<void> {
  if (isWeb) {
    cancelWebTaskNotifications();
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
  if (!(await loadTaskRemindersEnabled())) {
    return 'disabled';
  }
  const fireAt = Date.now() + SNOOZE_MINUTES * MINUTE;
  if (fireAt >= taskDueTime(task)) {
    return 'tooLate';
  }
  if (!(await requestReminderPermission())) {
    return 'denied';
  }

  const { route, label } = REMINDERS.unstarted;
  await cancelById(reminderId(task.id, 'initial'));
  await scheduleAt(reminderId(task.id, 'unstarted'), fireAt, `${label} ${task.title}`, 'unstarted', { route, taskId: task.id });
  return 'scheduled';
}

export async function scheduleTestReminder(): Promise<ReminderResult> {
  if (!(await requestReminderPermission())) {
    return 'denied';
  }

  await scheduleAt(TEST_ID, Date.now() + 10 * 1000, '¡YA PUES! Aviso de prueba', 'initial', { route: REMINDERS.initial.route });
  return 'scheduled';
}
