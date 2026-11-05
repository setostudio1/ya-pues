import { router } from 'expo-router';
import { useState } from 'react';

import SetTime from '../components/SetTime';
import { useTaskDraft } from '../context/TaskDraftContext';
import { isDateKey, isTime } from '../utils/tasks';

export default function SetTimeScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToTask() {
    if (!isDateKey(draft.dueDate) || !isTime(draft.dueTime)
      || new Date(`${draft.dueDate}T${draft.dueTime}:00`).getTime() <= Date.now()) {
      setError('Elige una hora futura. Si hace falta, vuelve al paso anterior para cambiar la fecha.');
      return;
    }
    router.push('/set-task');
  }

  return (
    <SetTime value={draft.dueTime} error={error} onContinue={continueToTask}
      onChange={(dueTime) => { updateDraft({ dueTime }); setError(''); }} />
  );
}
