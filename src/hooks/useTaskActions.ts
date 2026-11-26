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
      const cancelled = await cancelTaskReminders(taskId).then(() => true, () => false);
      await onChanged();
      if (!cancelled) setSaveError('Guardamos el cambio, pero no pudimos cancelar todos los avisos de la tarea.');
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
