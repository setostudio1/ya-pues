import type { ReminderData } from './reminderTypes';
import { reminderVariants } from './reminderVariants';

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function formatReminderCopy(reminder: ReminderData) {
  const task = clean(reminder.taskTitle) || 'tu tarea pendiente';
  const course = clean(reminder.courseName);
  const name = clean(reminder.displayName);
  const emphasis = `${task}${course ? ` · ${course}` : ''}`.toLocaleUpperCase('es');
  const heading = reminder.variant === 'personal' && name
    ? `${name.toLocaleUpperCase('es')}!!!` : reminderVariants[reminder.variant].heading;

  switch (reminder.variant) {
    case 'initial': return { heading, lead: 'TIENES QUE HACER ', emphasis, tail: '' };
    case 'unstarted': return { heading, lead: '¿TODAVÍA NO HAS EMPEZADO A HACER ', emphasis, tail: '?' };
    case 'urgent': return { heading, lead: 'TU TAREA ', emphasis, tail: ' ESTÁ POR VENCER.' };
    case 'personal': return { heading, lead: 'DEJA DE VER TIKTOK Y PONTE A ', emphasis, tail: '' };
  }
}
