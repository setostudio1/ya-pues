import { router } from 'expo-router';

import ProofPicker from '@/components/task-form/ProofPicker';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import { useTaskDraft } from '@/context/TaskDraftContext';

export default function SetProofScreen() {
  const { draft, updateDraft } = useTaskDraft();

  return (
    <TaskStepScreen step="Paso 4 - La evidencia" title="¿Cómo vas a demostrar que lo hiciste?"
      description="Elige el tipo de evidencia de tu compromiso." buttonLabel="Continuar"
      onContinue={() => router.push('/sign')}>
      <ProofPicker value={draft.proofType} onChange={(proofType) => updateDraft({ proofType })} />
    </TaskStepScreen>
  );
}
