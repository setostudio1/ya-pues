import { router } from 'expo-router';
import { useState } from 'react';
import SetTask from '../components/SetTask';
import { useTaskDraft } from '../context/TaskDraftContext';

export default function SetTaskScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToProof() {
    if (draft.title.trim().length < 3) { setError('Escribe al menos 3 caracteres para tu tarea.'); return; }
    router.push('/set-proof');
  }

  return (
    <SetTask value={draft.title} intensity={draft.intensity} error={error} onContinue={continueToProof}
      onChange={(title) => { updateDraft({ title }); setError(''); }}
      onIntensityChange={(intensity) => updateDraft({ intensity })} />
  );
}
