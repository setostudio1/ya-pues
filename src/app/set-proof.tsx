import { router } from 'expo-router';
import { View } from 'react-native';

import Button from '../components/Button';
import OptionCard from '../components/OptionCard';
import RouteScreen from '../components/RouteScreen';
import { theme } from '../constants/theme';
import { useTaskDraft } from '../context/TaskDraftContext';
import { PROOF_LABELS } from '../utils/tasks';

export default function SetProof() {
  const { draft, updateDraft } = useTaskDraft();
  return (
    <RouteScreen title="¿Cómo vas a demostrar que lo hiciste?" subtitle="Paso 4 · La evidencia"
      description="Elige el tipo de evidencia de tu compromiso.">
      <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de evidencia" style={{ gap: theme.spacing.sm }}>
        {(['photo', 'video', 'timelapse'] as const).map((proofType) => (
          <OptionCard key={proofType} label={PROOF_LABELS[proofType]} selected={draft.proofType === proofType}
            onPress={() => updateDraft({ proofType })} />
        ))}
      </View>
      <Button label="Continuar" onPress={() => router.push('/sign')} />
    </RouteScreen>
  );
}
