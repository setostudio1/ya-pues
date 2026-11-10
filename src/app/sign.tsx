import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import SignatureFields from '@/components/task-form/SignatureFields';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { scheduleTaskReminders } from '@/notifications/taskReminders';
import { addTask } from '@/storage/data';
import { PROOF_LABELS, TaskValidationError } from '@/utils/tasks';

export default function SignScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'image' ? 'image' : 'signature';
  const { draft, updateDraft, resetDraft } = useTaskDraft();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const saveLock = useRef(false);

  async function signTask() {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    setError('');
    try {
      const task = await addTask({ ...draft, signatureMode: mode });
      await scheduleTaskReminders(task).catch(() => undefined);
      resetDraft();
      router.dismissTo({ pathname: '/task-created', params: { taskId: task.id } });
    } catch (cause) {
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
      buttonLabel={saving ? 'Guardando…' : 'Firmar y guardar tarea'} busy={saving} error={error} onContinue={signTask}>
      <SignatureFields mode={mode} draft={draft} disabled={saving} onChange={updateDraft} />
    </TaskStepScreen>
  );
}
