export type ReminderVariant = 'initial' | 'unstarted' | 'urgent' | 'personal';

export type ReminderData = {
  id: string;
  taskId: string;
  variant: ReminderVariant;
  taskTitle: string;
  courseName?: string;
  displayName?: string;
  dueAt?: string;
};

export type ReminderScreenProps = {
  reminder: ReminderData;
  preview?: boolean;
  onDismiss: () => void;
  onGoHome: () => void;
  onSnooze?: (reminderId: string) => void;
  onContinue?: () => void;
  actionBusy?: boolean;
  actionError?: string;
};
