import { router } from 'expo-router';
import { useState } from 'react';

import SetTask from '@/components/task-form/SetTask';
import { ROUTES } from '@/constants/routes';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { isValidTitle, TITLE_ERROR } from '@/utils/tasks';

export default function SetTaskScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToProof() {
    const title = draft.title.trim();
    if (!isValidTitle(title)) {
      setError(TITLE_ERROR);
      return;
    }
    updateDraft({ title });
    router.push(ROUTES.setProof);
  }

  return (
    <SetTask value={draft.title} intensity={draft.intensity} error={error} onContinue={continueToProof}
      onChange={(title) => { updateDraft({ title }); setError(''); }}
      onIntensityChange={(intensity) => updateDraft({ intensity })} />
  );
}
