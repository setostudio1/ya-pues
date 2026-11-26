import { router } from 'expo-router';
import { useState } from 'react';

import AdvanceReminderPicker from '@/components/task-form/AdvanceReminderPicker';
import SetTime from '@/components/task-form/SetTime';
import { ROUTES } from '@/constants/routes';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { isDateKey, isTime, TaskValidationError, validateAdvanceReminder } from '@/utils/tasks';

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
    try {
      validateAdvanceReminder(draft);
      router.push(ROUTES.setTask);
    } catch (cause) {
      if (!(cause instanceof TaskValidationError)) throw cause;
      setError(cause.message);
    }
  }

  return (
    <SetTime value={draft.dueTime} error={error} onContinue={continueToTask}
      onChange={(dueTime) => { updateDraft({ dueTime }); setError(''); }}>
      <AdvanceReminderPicker value={draft.advanceReminder}
        onChange={(advanceReminder) => { updateDraft({ advanceReminder }); setError(''); }} />
    </SetTime>
  );
}
