import { router } from 'expo-router';
import { useState } from 'react';

import SetDate from '../components/SetDate';
import { useTaskDraft } from '../context/TaskDraftContext';
import { isDateKey, today } from '../utils/tasks';

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
    <SetDate value={draft.dueDate} error={error} onContinue={continueToTime}
      onChange={(dueDate) => { updateDraft({ dueDate }); setError(''); }} />
  );
}
