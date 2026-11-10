import { useRef, useState } from 'react';

import { cancelTaskReminders } from '@/notifications/taskReminders';
import { recordCompletion } from '@/storage/data';

export function useTaskCompletion(onCompleted: () => Promise<void>) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const completionLock = useRef(false);

  async function completeTask(taskId: string) {
    if (completionLock.current) return;
    completionLock.current = true;
    setCompletingId(taskId);
    setSaveError('');
    try {
      await recordCompletion(taskId);
      await cancelTaskReminders(taskId).catch(() => undefined);
      await onCompleted();
    } catch {
      setSaveError('No pudimos guardar la completación. Tu tarea sigue aquí; vuelve a intentarlo.');
    } finally {
      completionLock.current = false;
      setCompletingId(null);
    }
  }

  return { completingId, saveError, completeTask };
}
