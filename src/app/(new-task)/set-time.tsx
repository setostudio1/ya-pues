import { router } from 'expo-router';
import { useState } from 'react';

import SetTime from '@/components/task-form/SetTime';
import { ROUTES } from '@/constants/routes';
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
    router.push(ROUTES.setTask);
  }

  return (
    <SetTime value={draft.dueTime} error={error} onContinue={continueToTask}
      onChange={(dueTime) => { updateDraft({ dueTime }); setError(''); }} />
  );
}
