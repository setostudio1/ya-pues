import type { Task, TaskCompletion } from '../../types/tasks';
import { formatReminderCopy } from './reminderCopy';
import type { ReminderData, ReminderVariant } from './reminderTypes';

export const NOTIFICATION_OWNER = 'ya-pues-reminders-v1';
export const DAILY_ID = 'ya-pues.reminder.daily';
export const TEST_ID = 'ya-pues.reminder.test';
export const MAX_SCHEDULED = 60; // Leave room below iOS's pending notification limit.
export const SNOOZE_MINUTES = 10;
const MINUTE = 60_000;
const offsets: [ReminderVariant, number][] = [
  ['initial', 24 * 60], ['unstarted', 120], ['urgent', 45], ['personal', 15],
];

export type ReminderPreferences = {
  tasksEnabled: boolean;
  daily: { hour: number; minute: number } | null;
  snoozes: { taskId: string; fireAt: number }[];
};
export type Permission = 'granted' | 'undetermined' | 'denied' | 'unsupported';
export type NotificationPayload = {
  owner: typeof NOTIFICATION_OWNER;
  kind: 'task' | 'daily' | 'test';
  taskId?: string;
  variant?: ReminderVariant;
};
export type PlannedNotification = {
  id: string;
  title: string;
  body: string;
  payload: NotificationPayload;
  trigger: { type: 'date'; at: number } | { type: 'daily'; hour: number; minute: number };
};

export function defaultPreferences(): ReminderPreferences {
  return { tasksEnabled: false, daily: null, snoozes: [] };
}

export function validDailyTime(hour: number, minute: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23
    && Number.isInteger(minute) && minute >= 0 && minute <= 59;
}

export function parsePreferences(saved: string | null): ReminderPreferences {
  if (saved === null) return defaultPreferences();
  const value = JSON.parse(saved);
  if (!value || typeof value.tasksEnabled !== 'boolean'
    || !(value.daily === null || (value.daily && validDailyTime(value.daily.hour, value.daily.minute)))
    || !Array.isArray(value.snoozes)
    || !value.snoozes.every((entry: { taskId?: unknown; fireAt?: unknown } | null) => entry
      && typeof entry.taskId === 'string' && entry.taskId.length > 0
      && typeof entry.fireAt === 'number' && Number.isFinite(entry.fireAt))) {
    throw new Error('No pudimos leer la configuración de avisos. No se ha modificado.');
  }
  return value;
}

export function taskDueAt(task: Task): number {
  // Task dates and times are local wall-clock values, not UTC dates.
  return new Date(`${task.dueDate}T${task.dueTime}:00`).getTime();
}

export function taskReminder(task: Task, variant: ReminderVariant): ReminderData {
  return { id: taskNotificationId(task.id, variant), taskId: task.id, variant,
    taskTitle: task.title, displayName: task.signedBy, dueAt: new Date(taskDueAt(task)).toISOString() };
}

export function taskNotificationId(taskId: string, variant: ReminderVariant): string {
  return `ya-pues.reminder.task.${encodeURIComponent(taskId)}.${variant}`;
}

export function isManagedId(id: string): boolean {
  return id === DAILY_ID || id.startsWith('ya-pues.reminder.task.');
}

export function notificationSignature(plan: PlannedNotification): string {
  return JSON.stringify([plan.title, plan.body, plan.payload, plan.trigger]);
}

export function parseNotificationPayload(value: unknown): NotificationPayload | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (data.owner !== NOTIFICATION_OWNER) return null;
  if (data.kind === 'daily' || data.kind === 'test') return { owner: NOTIFICATION_OWNER, kind: data.kind };
  if (data.kind !== 'task' || typeof data.taskId !== 'string' || !data.taskId
    || !offsets.some(([variant]) => variant === data.variant)) return null;
  return { owner: NOTIFICATION_OWNER, kind: 'task', taskId: data.taskId, variant: data.variant as ReminderVariant };
}

export function planNotifications(tasks: Task[], completions: TaskCompletion[], preferences: ReminderPreferences,
  now = Date.now()): PlannedNotification[] {
  const completed = new Set(completions.map((entry) => entry.taskId));
  const plans: PlannedNotification[] = [];
  if (preferences.tasksEnabled) {
    for (const task of tasks) {
      const due = taskDueAt(task);
      if (completed.has(task.id) || !Number.isFinite(due) || due <= now) continue;
      const snooze = preferences.snoozes.find((entry) => entry.taskId === task.id);
      for (const [variant, minutes] of offsets) {
        // A task created within 24h gets its first notice after one minute, if still before its deadline.
        let at = variant === 'initial' ? Math.max(due - minutes * MINUTE, Date.parse(task.createdAt) + MINUTE)
          : due - minutes * MINUTE;
        if (snooze && variant === 'initial') continue;
        if (snooze && variant === 'unstarted') at = snooze.fireAt;
        if (!Number.isFinite(at) || at <= now || at >= due) continue;
        const reminder = taskReminder(task, variant);
        const copy = formatReminderCopy(reminder);
        plans.push({ id: reminder.id, title: copy.heading.replace(/\n/g, ' '),
          body: `${copy.lead}${copy.emphasis}${copy.tail}`,
          payload: { owner: NOTIFICATION_OWNER, kind: 'task', taskId: task.id, variant },
          trigger: { type: 'date', at } });
      }
    }
  }
  plans.sort((a, b) => (a.trigger.type === 'date' ? a.trigger.at : 0)
    - (b.trigger.type === 'date' ? b.trigger.at : 0) || a.id.localeCompare(b.id));
  if (preferences.daily) {
    plans.unshift({ id: DAILY_ID, title: '¡YA PUES!', body: 'Revisa tus tareas y sigue construyendo tu racha.',
      payload: { owner: NOTIFICATION_OWNER, kind: 'daily' }, trigger: { type: 'daily', ...preferences.daily } });
  }
  return plans;
}
