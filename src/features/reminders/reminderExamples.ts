import type { ReminderData, ReminderVariant } from './reminderTypes';

// Fictional, explicitly marked preview data; never read or written as saved tasks.
export function reminderExample(variant: ReminderVariant): ReminderData {
  return {
    id: `preview-${variant}`, taskId: 'preview-task', variant,
    taskTitle: variant === 'personal' ? 'hacer la entrega de animación' : 'la entrega de taller',
    displayName: 'Alex Rojas',
  };
}
