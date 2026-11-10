import { router } from 'expo-router';
import { useState } from 'react';

import DateSelector from '@/components/task-form/DateSelector';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { isDateKey, today } from '@/utils/tasks';

export default function SetDateScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToTime() {
    if (!isDateKey(draft.dueDate) || draft.dueDate < today()) {
      setError('Elige una fecha de hoy en adelante. Puedes cambiar el año debajo del selector.');
      return;
    }
    router.push('/set-time');
  }

  return (
    <TaskStepScreen step="Paso 1 · Fecha límite" title="¿Cuándo tiene que estar hecha esta tarea?"
      swipeHint="Para cambiar la fecha" buttonLabel="Establecer" error={error} onContinue={continueToTime}>
      <DateSelector value={draft.dueDate} onChange={(dueDate) => { updateDraft({ dueDate }); setError(''); }} />
    </TaskStepScreen>
  );
}
