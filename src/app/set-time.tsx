import { router } from 'expo-router';
import { useState } from 'react';

import SetTime from '../components/SetTime';
import { useTaskDraft } from '../context/TaskDraftContext';
import { askNotificationPermission, cancelReminder, scheduleDailyReminder } from '../notifications/notifications';
import { isDateKey, isTime } from '../utils/tasks';

export default function SetTimeScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  async function continueToTask() {
    if (!isDateKey(draft.dueDate) || !isTime(draft.dueTime)
      || new Date(`${draft.dueDate}T${draft.dueTime}:00`).getTime() <= Date.now()) {
      setError('Elige una hora futura. Si hace falta, vuelve al paso anterior para cambiar la fecha.');
      return;
    }

    // 1. Pedir permiso de notificaciones si no se ha otorgado aún
    const allowed = await askNotificationPermission();

    if (allowed) {
      // 2. Extraer la hora y minuto del dueTime (formato "HH:mm")
      const [hourStr, minuteStr] = draft.dueTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      // 3. Cancelar el recordatorio anterior y programar el nuevo a esa hora diaria
      await cancelReminder();
      await scheduleDailyReminder(hour, minute);
    }

    // 4. Ir a la siguiente pantalla (set-task)
    router.push('/set-task');
  }

  return (
    <SetTime value={draft.dueTime} error={error} onContinue={continueToTask}
      onChange={(dueTime) => { updateDraft({ dueTime }); setError(''); }} />
  );
}