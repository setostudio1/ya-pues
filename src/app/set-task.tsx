import { router } from 'expo-router';
import { useState } from 'react';

import IntensityPicker from '@/components/task-form/IntensityPicker';
import TaskInvitation from '@/components/task-form/TaskInvitation';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import TaskTitleField from '@/components/task-form/TaskTitleField';
import { useTaskDraft } from '@/context/TaskDraftContext';

export default function SetTaskScreen() {
  const { draft, updateDraft } = useTaskDraft();
  const [error, setError] = useState('');

  function continueToProof() {
    const title = draft.title.trim();
    if (title.length < 3 || title.length > 120) {
      setError('Escribe una tarea de entre 3 y 120 caracteres.');
      return;
    }
    updateDraft({ title });
    router.push('/set-proof');
  }

  return (
    <TaskStepScreen step="Paso 3 · La tarea" title="¿Qué tienes que hacer?"
      description="Descríbelo como una acción concreta" error={error} onContinue={continueToProof}>
      <TaskTitleField value={draft.title} onChange={(title) => { updateDraft({ title }); setError(''); }} />
      <IntensityPicker value={draft.intensity} onChange={(intensity) => updateDraft({ intensity })} />
      <TaskInvitation taskTitle={draft.title} />
    </TaskStepScreen>
  );
}
