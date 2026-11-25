import type { Task } from '@/types/tasks';

export type TaskCalendar = { id: string; title: string };

// Kept on the stored task, never in the creation draft. A pending creation is
// persisted before calling the OS so it can be recovered after an interruption.
export type CalendarSyncState = {
  calendarId: string;
  eventId?: string;
  startDate: string;
  endDate: string;
  fingerprint?: string;
};

export type StoredTask = Task & {
  calendarSync?: CalendarSyncState;
  calendarDeletedAt?: string;
};
