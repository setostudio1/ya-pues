import { useRef, useState } from 'react';

import { cancelTaskReminders } from '@/notifications/taskReminders';
import { deleteTask as deleteStoredTask, recordCompletion } from '@/storage/data';

export function useTaskActions(onChanged: () => Promise<void>) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const actionLock = useRef(false);

  async function runAction(taskId: string, action: () => Promise<void>, errorMessage: string) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusyId(taskId);
    setSaveError('');
    try {
      await action();
      await cancelTaskReminders(taskId).catch(() => undefined);
      await onChanged();
    } catch {
      setSaveError(errorMessage);
    } finally {
      actionLock.current = false;
      setBusyId(null);
    }
  }

  function completeTask(taskId: string) {
    return runAction(taskId, () => recordCompletion(taskId),
      'No pudimos guardar la completación. Tu tarea sigue aquí; vuelve a intentarlo.');
  }

  function deleteTask(taskId: string) {
    return runAction(taskId, () => deleteStoredTask(taskId),
      'No pudimos quitar la tarea. Sigue en tu lista; vuelve a intentarlo.');
  }

  return { busyId, saveError, completeTask, deleteTask };
}
