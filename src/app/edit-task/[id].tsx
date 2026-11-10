import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import EditTask from '@/components/task-form/EditTask';
import BackButton from '@/components/ui/BackButton';
import { ErrorState, LoadingState } from '@/components/ui/DataState';
import Screen from '@/components/ui/Screen';
import { ROUTES } from '@/constants/routes';
import { useStoredTasks } from '@/hooks/useStoredTasks';
import { cancelTaskReminders, scheduleTaskReminders } from '@/notifications/taskReminders';
import { updateTask } from '@/storage/data';
import type { TaskUpdate } from '@/types/tasks';
import { getTaskStatus, TaskValidationError } from '@/utils/tasks';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saving = useRef(false);

  const task = tasks.find((entry) => entry.id === id);
  const status = task && getTaskStatus(task, completions.find((entry) => entry.taskId === task.id));

  async function save(changes: TaskUpdate) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setSaveError('');
    try {
      const updated = await updateTask(id, changes);
      await cancelTaskReminders(id).catch(() => undefined);
      await scheduleTaskReminders(updated).catch(() => undefined);
      if (router.canGoBack()) router.back();
      else router.replace(ROUTES.home);
    } catch (cause) {
      setSaveError(cause instanceof TaskValidationError
        ? cause.message
        : 'No pudimos guardar los cambios. Tu tarea sigue igual; vuelve a intentarlo.');
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  if (loading && !task) {
    return <Screen><LoadingState /></Screen>;
  }

  if (error || !task || status === 'completed' || status === 'completedLate') {
    const message = error || (task ? 'Una tarea completada no se puede editar.' : 'No encontramos esta tarea.');
    return (
      <Screen>
        <BackButton />
        <ErrorState message={message} onRetry={error ? () => void reload() : undefined} />
      </Screen>
    );
  }

  return <EditTask key={task.id} task={task} isOverdue={status === 'overdue'} busy={busy}
    error={saveError} onSave={(changes) => void save(changes)} />;
}
