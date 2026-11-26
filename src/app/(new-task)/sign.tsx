import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import SignatureFields from '@/components/task-form/SignatureFields';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { PROOF_LABELS } from '@/constants/tasks';
import { useSession } from '@/context/SessionContext';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { scheduleTaskReminders } from '@/notifications/taskReminders';
import { addTask } from '@/storage/data';
import { ExpiredAdvanceReminderError, TaskValidationError } from '@/utils/tasks';

export default function SignScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'image' ? 'image' : 'signature';
  const { user } = useSession();
  const { draft, updateDraft, resetDraft } = useTaskDraft();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expiredAdvance, setExpiredAdvance] = useState(false);
  const saveLock = useRef(false);

  async function signTask(skipAdvance = false) {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    setError('');
    setExpiredAdvance(false);
    try {
      const task = await addTask({
        ...draft, signatureMode: mode,
        advanceReminder: skipAdvance ? { kind: 'none' } : draft.advanceReminder,
      }, user?.id);
      await scheduleTaskReminders(task).catch(() => undefined);
      resetDraft();
      router.dismissTo({ pathname: ROUTES.taskCreated, params: { taskId: task.id } });
    } catch (cause) {
      setExpiredAdvance(cause instanceof ExpiredAdvanceReminderError);
      setError(cause instanceof TaskValidationError
        ? cause.message
        : 'No pudimos guardar tu tarea. No se ha borrado nada; intenta otra vez.');
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  return (
    <TaskStepScreen step="Último paso - El compromiso" title="Firma tu compromiso"
      description={`Me comprometo a ${draft.title || 'completar mi tarea'} antes del ${draft.dueDate} a las ${draft.dueTime}. Evidencia: ${PROOF_LABELS[draft.proofType]}.`}
      buttonLabel={saving ? 'Guardando…' : 'Firmar y guardar tarea'} busy={saving} error={error} onContinue={() => void signTask()}>
      <SignatureFields mode={mode} draft={draft} disabled={saving} onChange={updateDraft} />
      {expiredAdvance && <Button label="Guardar solo con el aviso a la hora exacta" variant="secondary"
        disabled={saving} onPress={() => void signTask(true)} />}
    </TaskStepScreen>
  );
}
