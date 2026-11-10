import { router } from 'expo-router';
import { useState } from 'react';

import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import TimeSelector from '@/components/task-form/TimeSelector';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { isDateKey, isTime } from '@/utils/tasks';

function isFutureDeadline(dueDate: string, dueTime: string) {
  return isDateKey(dueDate) && isTime(dueTime)
    && new Date(`${dueDate}T${dueTime}:00`).getTime() > Date.now();
}

export default function SetTimeScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToTask() {
    if (!isFutureDeadline(draft.dueDate, draft.dueTime)) {
      setError('Elige una hora futura. Si hace falta, vuelve al paso anterior para cambiar la fecha.');
      return;
    }
    router.push('/set-task');
  }

  return (
    <TaskStepScreen step="Paso 2 · Hora límite" title="¿A qué hora tiene que estar hecha esta tarea?"
      swipeHint="Para cambiar la hora" buttonLabel="Establecer" error={error} onContinue={continueToTask}>
      <TimeSelector value={draft.dueTime} onChange={(dueTime) => { updateDraft({ dueTime }); setError(''); }} />
    </TaskStepScreen>
  );
}
