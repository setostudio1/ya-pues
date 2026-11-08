import type { Task, TaskCompletion, TaskDraft } from '../types/tasks';

export const INTENSITY_LABELS = { low: 'Leve', medium: 'Media', high: 'Alta' } as const;
export const PROOF_LABELS = { photo: 'Foto', video: 'Video', timelapse: 'Timelapse' } as const;

export class TaskValidationError extends Error {}

export function today(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && today(date) === value;
}

export function isTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function createTaskDraft(now = new Date()): TaskDraft {
  const deadline = new Date(now);
  deadline.setMinutes(deadline.getMinutes() + 30);
  return {
    id: createId(), title: '', dueDate: today(deadline),
    dueTime: `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`,
    intensity: 'medium', proofType: 'photo', signedBy: '',
    signatureMode: 'signature', signatureImageUri: '',
  };
}

export function buildTask(draft: TaskDraft, now = new Date()): Task {
  if (!draft.id || draft.title.trim().length < 3 || draft.title.trim().length > 120) {
    throw new TaskValidationError('Escribe una tarea de entre 3 y 120 caracteres.');
  }
  if (!isDateKey(draft.dueDate)) throw new TaskValidationError('Escribe una fecha válida con formato AAAA-MM-DD.');
  if (!isTime(draft.dueTime)) throw new TaskValidationError('Escribe una hora válida con formato HH:MM.');
  if (new Date(`${draft.dueDate}T${draft.dueTime}:00`).getTime() < now.getTime()) {
    throw new TaskValidationError('La fecha y hora límite deben estar en el futuro.');
  }
  if (draft.signedBy.trim().length < 2 || draft.signedBy.trim().length > 80) {
    throw new TaskValidationError('Escribe tu nombre para confirmar el compromiso.');
  }
  if (draft.signatureMode === 'image' && !/^https?:\/\/\S+$/i.test(draft.signatureImageUri.trim())) {
    throw new TaskValidationError('Escribe el enlace http o https de la imagen de tu firma.');
  }
  return {
    ...draft, title: draft.title.trim(), signedBy: draft.signedBy.trim(),
    signatureImageUri: draft.signatureMode === 'image' ? draft.signatureImageUri.trim() : '',
    createdAt: now.toISOString(),
  };
}

export function calculateProgress(tasks: Task[], completions: TaskCompletion[], now = new Date()) {
  const taskIds = new Set(tasks.map((task) => task.id));
  const unique = new Map<string, TaskCompletion>();
  for (const entry of completions) {
    if (taskIds.has(entry.taskId) && !unique.has(entry.taskId)) unique.set(entry.taskId, entry);
  }
  const entries = [...unique.values()];
  const dates = new Set(entries.map((entry) => entry.date));
  const cursor = new Date(now);
  // Yesterday's streak stays alive until the user has had a chance to act today.
  if (!dates.has(today(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(today(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + index);
    const key = today(date);
    return { date: key, count: entries.filter((entry) => entry.date === key).length };
  });
  return {
    total: tasks.length, completed: entries.length, pending: tasks.length - entries.length,
    percentage: tasks.length ? Math.round(entries.length / tasks.length * 100) : 0,
    todayCount: entries.filter((entry) => entry.date === today(now)).length,
    streak, week,
  };
}
