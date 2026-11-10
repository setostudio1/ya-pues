import { loadReminder } from '@/notifications/notifications';
import { saveDailyReminder } from '@/storage/preferences';
import type { ReminderRoute, WebNotificationKind } from '@/types/reminders';

export type WebNotification = {
  id: string;
  kind: WebNotificationKind;
  title: string;
  body: string;
  route?: ReminderRoute;
  taskId?: string;
};

type Listener = (notification: WebNotification) => void;

const DAILY_ID = 'daily-reminder';
const DAY = 24 * 60 * 60 * 1000;
const MAX_TIMEOUT = 2 ** 31 - 1;

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pending = new Map<string, WebNotification>();
const listeners = new Set<Listener>();

export function subscribeWebNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function show(notification: WebNotification) {
  listeners.forEach((listener) => listener(notification));
}

function startTimer(id: string, time: number, onFire: () => void) {
  const delay = Math.max(0, time - Date.now());
  const timer = delay > MAX_TIMEOUT
    ? setTimeout(() => startTimer(id, time, onFire), MAX_TIMEOUT)
    : setTimeout(onFire, delay);
  timers.set(id, timer);
}

export function scheduleWebNotification(time: number, notification: WebNotification) {
  cancelWebNotification(notification.id);
  pending.set(notification.id, notification);
  startTimer(notification.id, time, () => {
    timers.delete(notification.id);
    pending.delete(notification.id);
    show(notification);
  });
}

export function cancelWebNotification(id: string) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  pending.delete(id);
}

export function cancelWebTaskNotifications() {
  for (const [id, notification] of pending) {
    if (notification.taskId !== undefined) {
      cancelWebNotification(id);
    }
  }
}

export function getWebNotificationIds(): Set<string> {
  return new Set(pending.keys());
}

function nextDailyTime(hour: number, minute: number): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  return next.getTime() > Date.now() ? next.getTime() : next.getTime() + DAY;
}

function startDailyTimer(hour: number, minute: number) {
  clearTimeout(timers.get(DAILY_ID));
  startTimer(DAILY_ID, nextDailyTime(hour, minute), async () => {
    const saved = await loadReminder().catch(() => null);
    if (saved?.hour !== hour || saved.minute !== minute) {
      return;
    }
    show({ id: DAILY_ID, kind: 'daily', title: '¡Ya pues! Hora de tus tareas',
      body: 'Revisa tus actividades pendientes del día.' });
    startDailyTimer(hour, minute);
  });
}

export async function scheduleWebDailyReminder(hour: number, minute: number) {
  await saveDailyReminder({ id: DAILY_ID, hour, minute });
  startDailyTimer(hour, minute);
}

export async function restoreWebDailyReminder() {
  const saved = await loadReminder();
  if (saved !== null) {
    startDailyTimer(saved.hour, saved.minute);
  }
}
