import { StyleSheet, View } from 'react-native';

import OptionCard from '@/components/ui/OptionCard';
import { theme } from '@/constants/theme';
import type { ProofType } from '@/types/tasks';
import { PROOF_LABELS } from '@/utils/tasks';

const PROOF_TYPES: readonly ProofType[] = ['photo', 'video', 'timelapse'];

export default function ProofPicker({ value, onChange }: { value: ProofType; onChange: (value: ProofType) => void }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de evidencia" style={styles.options}>
      {PROOF_TYPES.map((proofType) => (
        <OptionCard key={proofType} label={PROOF_LABELS[proofType]} selected={value === proofType}
          onPress={() => onChange(proofType)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { gap: theme.spacing.sm },
});
