import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import Button from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import RouteScreen from '../../components/RouteScreen';
import { useStoredTasks } from '../../hooks/useStoredTasks';
import { useNotifications } from './NotificationsProvider';
import { taskReminder } from './notificationPlan';
import { notificationService } from './notificationService';
import ReminderScreen from './ReminderScreen';
import { reminderExample } from './reminderExamples';
import type { ReminderVariant } from './reminderTypes';

function dismiss() { if (router.canGoBack()) router.back(); else router.replace('/'); }
function goHome() { router.dismissTo('/'); }

export default function ReminderRoute({ variant }: { variant: ReminderVariant }) {
  const params = useLocalSearchParams<{ taskId?: string; preview?: string }>();
  if (params.preview === '1') return <ReminderScreen reminder={reminderExample(variant)} preview
    onDismiss={dismiss} onGoHome={goHome}
    onSnooze={variant === 'initial' ? () => router.push({ pathname: '/notification-2', params: { preview: '1' } }) : undefined}
    onContinue={variant === 'initial' ? () => router.push({ pathname: '/notification-4', params: { preview: '1' } }) : undefined} />;
  return <LiveReminder variant={variant} taskId={params.taskId} />;
}

function LiveReminder({ variant, taskId }: { variant: ReminderVariant; taskId?: string }) {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const { run, busy, error: actionError } = useNotifications();
  const [snoozing, setSnoozing] = useState(false);
  const lock = useRef(false);
  const task = tasks.find((entry) => entry.id === taskId);
  const completed = completions.some((entry) => entry.taskId === taskId);

  async function snooze() {
    if (!task || lock.current) return;
    lock.current = true;
    setSnoozing(true);
    try { if (await run(() => notificationService.snooze(task.id))) goHome(); }
    finally { lock.current = false; setSnoozing(false); }
  }

  if (loading || error || !task || completed) return <RouteScreen title="Recordatorio">
    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { void reload(); }} />
      : <EmptyState message={completed ? 'Esta tarea ya está completada.' : 'No encontramos la tarea de este aviso.'} />}
    <Button label="Volver al inicio" onPress={goHome} />
  </RouteScreen>;

  return <ReminderScreen reminder={taskReminder(task, variant)} onDismiss={dismiss} onGoHome={goHome}
    onSnooze={variant === 'initial' ? () => { void snooze(); } : undefined}
    onContinue={variant === 'initial' ? goHome : undefined} actionBusy={busy || snoozing} actionError={actionError} />;
}
