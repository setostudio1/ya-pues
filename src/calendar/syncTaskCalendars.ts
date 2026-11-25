import { CALENDAR_PERMISSION_DENIED, loadDeviceCalendar } from '@/calendar/deviceCalendar';
import { publishCalendarSyncStatus } from '@/calendar/syncStatus';
import { reconcileTaskCalendar, taskEventFingerprint, type TaskCalendarDevice } from '@/calendar/taskCalendar';
import type { StoredTask } from '@/types/calendar';

function needsCalendarSync(task: StoredTask): boolean {
  if (task.calendarDeletedAt) return true;
  if (!task.calendar) return task.calendarSync !== undefined;
  return !task.calendarSync?.eventId || task.calendarSync.fingerprint !== taskEventFingerprint(task);
}

export async function syncSavedCalendars(
  savedTasks: StoredTask[],
  ownerId: string | undefined,
  persistTasks: (tasks: StoredTask[]) => Promise<void>,
): Promise<void> {
  let tasks = savedTasks;
  const pending = tasks.filter((task) => (task.ownerId === undefined || task.ownerId === ownerId) && needsCalendarSync(task));
  if (pending.length === 0) {
    publishCalendarSyncStatus('');
    return;
  }
  try {
    const calendar = await loadDeviceCalendar();
    const permission = await calendar.getCalendarPermissions();
    // Background retries must never open a permission prompt.
    if (!permission.granted) throw new Error(CALENDAR_PERMISSION_DENIED);
    const calendars = await calendar.getCalendars(calendar.EntityTypes.EVENT);
    const device: TaskCalendarDevice = {
      getEvent: async (id) => {
        try {
          return await calendar.ExpoCalendarEvent.get(id);
        } catch (cause) {
          if (typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'ERR_EVENT_NOT_FOUND') return undefined;
          throw cause;
        }
      },
      findEvents: async (id, start, end, marker) => {
        const events = await calendar.listEvents([id], start, end);
        return events.filter((event) => event.notes?.split('\n').includes(marker));
      },
      createEvent: async (id, details) => {
        const target = calendars.find((entry) => entry.id === id && entry.allowsModifications && entry.isSynced !== false);
        if (!target) throw new Error('El calendario elegido ya no está disponible para escribir. Elige otro al editar la tarea.');
        return target.createEvent(details);
      },
    };
    let failed = false;
    for (const task of pending) {
      try {
        await reconcileTaskCalendar(task, device, async (updated) => {
          const next = updated
            ? tasks.map((entry) => entry.id === task.id ? updated : entry)
            : tasks.filter((entry) => entry.id !== task.id);
          await persistTasks(next);
          tasks = next;
        });
      } catch {
        failed = true;
      }
    }
    publishCalendarSyncStatus(failed
      ? 'Tus tareas están guardadas. Hay cambios pendientes en el calendario; revisa el calendario elegido y vuelve a intentar. Se reintentará al volver a la app.'
      : '');
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : '';
    publishCalendarSyncStatus(`Tus tareas están guardadas. La sincronización del calendario está pendiente. ${detail}`.trim());
  }
}

