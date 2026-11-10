import type { Task, TaskCompletion } from '../../types/tasks';
import { isManagedId, MAX_SCHEDULED, NOTIFICATION_OWNER, notificationSignature, planNotifications,
  SNOOZE_MINUTES, taskDueAt, TEST_ID, validDailyTime,
  type Permission, type PlannedNotification, type ReminderPreferences } from './notificationPlan';

export type NotificationPort = {
  readPreferences: () => Promise<ReminderPreferences>;
  writePreferences: (preferences: ReminderPreferences) => Promise<void>;
  loadTasks: () => Promise<Task[]>;
  loadCompletions: () => Promise<TaskCompletion[]>;
  permission: (request: boolean) => Promise<Permission>;
  pending: () => Promise<{ id: string; signature?: unknown }[]>;
  schedule: (plan: PlannedNotification) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  dismissInactive: (activeIds: Set<string>, tasksEnabled: boolean) => Promise<void>;
  now: () => number;
};
export type NotificationSnapshot = {
  preferences: ReminderPreferences;
  permission: Permission;
  scheduledCount: number;
  eligibleCount: number;
};

export function createNotificationEngine(port: NotificationPort) {
  let pending: Promise<unknown> = Promise.resolve();
  function serial<T>(work: () => Promise<T>): Promise<T> {
    const result = pending.then(work);
    pending = result.catch(() => undefined);
    return result;
  }

  async function reconcile(preferences: ReminderPreferences): Promise<NotificationSnapshot> {
    const permission = await port.permission(false);
    if (permission === 'unsupported') return { preferences, permission, scheduledCount: 0, eligibleCount: 0 };
    // Read everything before cancelling anything. A failed/corrupt task read must not erase schedules.
    const [tasks, completions, existing] = await Promise.all([port.loadTasks(), port.loadCompletions(), port.pending()]);
    const all = permission === 'granted' ? planNotifications(tasks, completions, preferences, port.now()) : [];
    const desired = all.slice(0, MAX_SCHEDULED);
    const byId = new Map(desired.map((plan) => [plan.id, plan]));
    const unchanged = new Set<string>();
    for (const entry of existing) {
      if (!isManagedId(entry.id)) continue;
      const plan = byId.get(entry.id);
      if (plan && entry.signature === notificationSignature(plan)) unchanged.add(entry.id);
      else await port.cancel(entry.id);
    }
    for (const plan of desired) {
      if (!unchanged.has(plan.id)) await port.schedule(plan);
    }
    const completed = new Set(completions.map((entry) => entry.taskId));
    await port.dismissInactive(new Set(tasks.filter((task) => !completed.has(task.id)).map((task) => task.id)), preferences.tasksEnabled);
    return { preferences, permission, scheduledCount: desired.length, eligibleCount: all.length };
  }

  async function allow() {
    const permission = await port.permission(true);
    if (permission !== 'granted') throw new Error(permission === 'unsupported'
      ? 'Los avisos del sistema están disponibles en Android e iOS. Abre la app en tu celular.'
      : 'Sin permiso para avisos. Puedes habilitarlos en Ajustes del celular y volver a intentar.');
  }

  return {
    sync: () => serial(async () => reconcile(await port.readPreferences())),
    setTasksEnabled: (enabled: boolean) => serial(async () => {
      if (enabled) await allow();
      const preferences = await port.readPreferences();
      preferences.tasksEnabled = enabled;
      if (!enabled) preferences.snoozes = [];
      await port.writePreferences(preferences);
      return reconcile(preferences);
    }),
    setDaily: (daily: ReminderPreferences['daily']) => serial(async () => {
      if (daily && !validDailyTime(daily.hour, daily.minute)) throw new Error('Usa una hora de 0 a 23 y minutos de 0 a 59.');
      if (daily) await allow();
      const preferences = await port.readPreferences();
      preferences.daily = daily;
      await port.writePreferences(preferences);
      return reconcile(preferences);
    }),
    snooze: (taskId: string) => serial(async () => {
      const preferences = await port.readPreferences();
      if (!preferences.tasksEnabled) throw new Error('Activa primero los avisos de tareas en Recordatorios.');
      await allow();
      const [tasks, completions] = await Promise.all([port.loadTasks(), port.loadCompletions()]);
      const task = tasks.find((entry) => entry.id === taskId);
      const fireAt = port.now() + SNOOZE_MINUTES * 60_000;
      if (!task || completions.some((entry) => entry.taskId === taskId)) throw new Error('Esta tarea ya no está pendiente.');
      if (fireAt >= taskDueAt(task)) throw new Error('Quedan menos de 10 minutos. No puedes posponer el aviso más allá del plazo.');
      preferences.snoozes = [...preferences.snoozes.filter((entry) => entry.taskId !== taskId), { taskId, fireAt }];
      await port.writePreferences(preferences);
      return reconcile(preferences);
    }),
    test: () => serial(async () => {
      await allow();
      const snapshot = await reconcile(await port.readPreferences());
      await port.schedule({ id: TEST_ID, title: '¡YA PUES! Aviso de prueba',
        body: 'Tus notificaciones funcionan. Toca para volver a tus tareas.',
        payload: { owner: NOTIFICATION_OWNER, kind: 'test' }, trigger: { type: 'date', at: port.now() + 10_000 } });
      return snapshot;
    }),
  };
}
