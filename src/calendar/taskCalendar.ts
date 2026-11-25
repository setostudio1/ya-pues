import type { StoredTask } from '@/types/calendar';
import type { Task } from '@/types/tasks';

export type CalendarEventDetails = {
  title: string;
  notes: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  alarms: [];
};

export type LinkedEvent = {
  id: string;
  update: (details: CalendarEventDetails) => Promise<void>;
  delete: () => Promise<void>;
};

export type TaskCalendarDevice = {
  getEvent: (id: string) => Promise<LinkedEvent | undefined>;
  findEvents: (calendarId: string, start: Date, end: Date, marker: string) => Promise<LinkedEvent[]>;
  createEvent: (calendarId: string, details: CalendarEventDetails) => Promise<LinkedEvent>;
};

export function taskCalendarMarker(taskId: string): string {
  return `Ya Pues · tarea: ${taskId}`;
}

export function taskEventDetails(task: Task): CalendarEventDetails {
  const endDate = new Date(`${task.dueDate}T${task.dueTime}:00`);
  return {
    title: task.title,
    notes: [task.description, taskCalendarMarker(task.id)].filter(Boolean).join('\n\n'),
    // The task has a deadline, not a duration: reserve the 30 minutes ending at it.
    startDate: new Date(endDate.getTime() - 30 * 60 * 1000),
    endDate,
    allDay: false,
    alarms: [],
  };
}

export function taskEventFingerprint(task: Task): string {
  return JSON.stringify([task.calendar?.id, taskEventDetails(task)]);
}

/** Called only inside the task storage write queue. Every native side effect
 * has a durable checkpoint; a failed sync leaves the task itself saved. */
export async function reconcileTaskCalendar(
  task: StoredTask,
  device: TaskCalendarDevice,
  persist: (task: StoredTask | undefined) => Promise<void>,
): Promise<void> {
  const desired = !task.calendarDeletedAt ? task.calendar : undefined;
  let state = task.calendarSync;

  if (state) {
    let events: LinkedEvent[];
    if (state.eventId) {
      // Never interpret an arbitrary provider/permission error as a missing
      // event: doing so could create a second event after a temporary failure.
      const event = await device.getEvent(state.eventId);
      events = event ? [event] : await device.findEvents(state.calendarId, new Date(state.startDate), new Date(state.endDate), taskCalendarMarker(task.id));
    } else {
      events = await device.findEvents(state.calendarId, new Date(state.startDate), new Date(state.endDate), taskCalendarMarker(task.id));
    }

    if (!desired || desired.id !== state.calendarId) {
      for (const event of events) await event.delete();
      task = { ...task, calendarSync: undefined };
      await persist(task.calendarDeletedAt ? undefined : task);
      state = undefined;
      if (!desired) return;
    } else if (events.length > 0) {
      const [event, ...duplicates] = events;
      // Recover an event created just before an interrupted storage write.
      // Clean extras while the recovery window is still durable, then keep the
      // remaining ID durable before changing the event's date.
      for (const duplicate of duplicates) await duplicate.delete();
      state = { ...state, eventId: event.id };
      task = { ...task, calendarSync: state };
      await persist(task);
      const fingerprint = taskEventFingerprint(task);
      if (state.fingerprint !== fingerprint) {
        const details = taskEventDetails(task);
        await event.update(details);
        await persist({ ...task, calendarSync: { ...state, fingerprint,
          startDate: details.startDate.toISOString(), endDate: details.endDate.toISOString() } });
      }
      return;
    }
  }

  if (!desired) {
    if (task.calendarDeletedAt) await persist(undefined);
    return;
  }

  const details = taskEventDetails(task);
  // Do not replace an uncertain creation window: search it first on retry,
  // even if the user has edited the deadline in the meantime.
  state = {
    calendarId: desired.id,
    startDate: details.startDate.toISOString(),
    endDate: details.endDate.toISOString(),
  };
  task = { ...task, calendarSync: state };
  await persist(task);
  const event = await device.createEvent(desired.id, details);
  await persist({ ...task, calendarSync: { ...state, eventId: event.id, fingerprint: taskEventFingerprint(task) } });
}
