import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import ReminderScreen from '@/components/reminders/ReminderScreen';
import Button from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/DataState';
import RouteScreen from '@/components/ui/RouteScreen';
import { EXAMPLE_TASK_TITLE } from '@/constants/reminders';
import { ROUTES } from '@/constants/routes';
import { useSession } from '@/context/SessionContext';
import { useStoredTasks } from '@/hooks/useStoredTasks';
import { snoozeTaskReminder } from '@/notifications/taskReminders';
import type { ReminderResult, ReminderVariant } from '@/types/reminders';
import { firstName } from '@/utils/auth';

const SNOOZE_ERRORS: Partial<Record<ReminderResult, string>> = {
  denied: 'Activa los permisos de notificaciones para posponer el aviso.',
  disabled: 'Activa los avisos de tareas en Recordatorios para posponer.',
  tooLate: 'Quedan menos de 10 minutos. No puedes posponer el aviso más allá del plazo.',
};

function goHome() {
  router.dismissTo(ROUTES.home);
}

function close() {
  if (router.canGoBack()) router.back();
  else goHome();
}

export default function ReminderRoute({ variant }: { variant: ReminderVariant }) {
  const { taskId, preview } = useLocalSearchParams<{ taskId?: string; preview?: string }>();
  const { tasks, completions, loading } = useStoredTasks();
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isPreview = preview === '1';
  const task = tasks.find((entry) => entry.id === taskId);
  const completed = completions.some((entry) => entry.taskId === taskId);

  async function snooze() {
    if (isPreview) {
      router.push({ pathname: ROUTES.reminderUnstarted, params: { preview: '1' } });
      return;
    }
    if (!task) return;
    setBusy(true);
    setError('');
    const result = await snoozeTaskReminder(task).catch((): ReminderResult => 'denied');
    setBusy(false);
    const snoozeError = SNOOZE_ERRORS[result];
    if (snoozeError) setError(snoozeError);
    else goHome();
  }

  function continueTask() {
    if (isPreview) router.push({ pathname: ROUTES.reminderPersonal, params: { preview: '1' } });
    else goHome();
  }

  if (!isPreview && (loading || !task || completed)) {
    return (
      <RouteScreen title="Recordatorio">
        {loading ? <LoadingState />
          : <EmptyState message={completed ? 'Esta tarea ya está completada.' : 'No encontramos la tarea de este aviso.'} />}
        <Button label="Volver al inicio" onPress={goHome} />
      </RouteScreen>
    );
  }

  return (
    <ReminderScreen
      variant={variant}
      taskTitle={task?.title ?? EXAMPLE_TASK_TITLE}
      name={firstName(user?.name ?? '')}
      preview={isPreview}
      busy={busy}
      error={error}
      onClose={close}
      onHome={goHome}
      onSnooze={() => { void snooze(); }}
      onContinue={continueTask}
    />
  );
}
