import { useSession } from '@/context/SessionContext';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { cancelTaskReminders } from '@/notifications/taskReminders';
import type { Task } from '@/types/tasks';

export function useSignOut(tasks: Task[]) {
  const { endSession } = useSession();
  const { resetDraft } = useTaskDraft();

  return async function signOut() {
    resetDraft();
    for (const task of tasks) {
      await cancelTaskReminders(task.id).catch(() => undefined);
    }
    await endSession();
  };
}
