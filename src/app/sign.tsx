import { Link, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';

import Button from '../components/Button';
import { ErrorState } from '../components/DataState';
import InputField from '../components/InputField';
import RouteScreen from '../components/RouteScreen';
import { useTaskDraft } from '../context/TaskDraftContext';
import { useNotifications } from '../features/reminders/NotificationsProvider';
import { addTask } from '../storage/data';
import { PROOF_LABELS, TaskValidationError } from '../utils/tasks';

export default function Sign() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'image' ? 'image' : 'signature';
  const { draft, updateDraft, resetDraft } = useTaskDraft();
  const { refresh: refreshNotifications } = useNotifications();
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
      await refreshNotifications();
      resetDraft();
      router.replace({ pathname: '/task-created', params: { taskId: task.id } });
    } catch (cause) {
      setError(cause instanceof TaskValidationError ? cause.message : 'No pudimos guardar tu tarea. No se ha borrado nada; intenta otra vez.');
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  return (
    <RouteScreen title="Firma tu compromiso" subtitle="Último paso · El compromiso"
      description={`Me comprometo a ${draft.title || 'completar mi tarea'} antes del ${draft.dueDate} a las ${draft.dueTime}. Evidencia: ${PROOF_LABELS[draft.proofType]}.`}>
      <InputField label="Tu nombre para firmar el compromiso" value={draft.signedBy} maxLength={80}
        editable={!saving} onChangeText={(signedBy) => updateDraft({ signedBy })} />
      {mode === 'image' && <InputField label="Enlace de la imagen de tu firma" value={draft.signatureImageUri}
        placeholder="https://…" keyboardType="url" maxLength={2048} autoCapitalize="none" autoCorrect={false}
        editable={!saving} onChangeText={(signatureImageUri) => updateDraft({ signatureImageUri })} />}
      <Link href={{ pathname: '/sign', params: { mode: mode === 'image' ? 'signature' : 'image' } }} replace asChild>
        <Button label={mode === 'image' ? 'Firmar con mi nombre' : 'Usar una imagen de mi firma'} variant="secondary" disabled={saving} />
      </Link>
      {!!error && <ErrorState message={error} />}
      <Button label={saving ? 'Guardando…' : 'Firmar y guardar tarea'} disabled={saving}
        accessibilityState={{ busy: saving }} onPress={signTask} />
    </RouteScreen>
  );
}
