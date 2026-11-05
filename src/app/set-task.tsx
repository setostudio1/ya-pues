import { router } from 'expo-router';
import { useState } from 'react';

import SetTask from '../components/SetTask';
import { useTaskDraft } from '../context/TaskDraftContext';

export default function SetTaskScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToProof() {
    const taskName = draft.title.trim();
    if (taskName.length < 3 || taskName.length > 120) {
      setError('Escribe una tarea de entre 3 y 120 caracteres.');
      return;
    }
    updateDraft({ title: taskName });
    router.push('/set-proof');
  }

  return (
    <SetTask value={draft.title} intensity={draft.intensity} error={error} onContinue={continueToProof}
      onChange={(title) => { updateDraft({ title }); setError(''); }}
      onIntensityChange={(intensity) => updateDraft({ intensity })} />
  );
}
