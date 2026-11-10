import { StyleSheet, View } from 'react-native';

import OptionCard from '@/components/ui/OptionCard';
import { PROOF_LABELS, PROOF_TYPES } from '@/constants/tasks';
import { theme } from '@/constants/theme';
import type { ProofType } from '@/types/tasks';

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
  options: { flexDirection: theme.directions.proofOptions, gap: theme.spacing.sm },
});
