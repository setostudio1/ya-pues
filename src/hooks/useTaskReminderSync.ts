import { useEffect } from 'react';

import { syncTaskReminders } from '@/notifications/taskReminders';
import type { Task, TaskCompletion } from '@/types/tasks';

export function useTaskReminderSync(tasks: Task[], completions: TaskCompletion[], loading: boolean) {
  useEffect(() => {
    if (!loading) {
      syncTaskReminders(tasks, completions).catch(() => undefined);
    }
  }, [tasks, completions, loading]);
}
