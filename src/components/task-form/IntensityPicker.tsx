import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { Intensity } from '@/types/tasks';
import { INTENSITY_LABELS } from '@/utils/tasks';

const INTENSITIES: readonly Intensity[] = ['low', 'medium', 'high'];
const INTENSITY_COLORS: Record<Intensity, string> = {
  low: theme.colors.intensityLow,
  medium: theme.colors.intensityMedium,
  high: theme.colors.intensityHigh,
};

type Props = {
  value: Intensity;
  onChange: (intensity: Intensity) => void;
};

export default function IntensityPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Intensidad</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad" style={styles.row}>
        {INTENSITIES.map((intensity) => {
          const selected = value === intensity;
          return (
            <Pressable key={intensity} accessibilityRole="radio" accessibilityState={{ checked: selected }}
              onPress={() => onChange(intensity)}
              style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}>
              <View style={[styles.dot, { backgroundColor: INTENSITY_COLORS[intensity] }]} />
              <Text style={[styles.chipLabel, selected && styles.selectedLabel]}>{INTENSITY_LABELS[intensity]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  label: { ...theme.typography.label, fontSize: theme.text.body, color: theme.colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: { flexBasis: 88, flexGrow: 1, minHeight: 44, padding: theme.spacing.sm, borderRadius: theme.radius.full,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 },
  selectedChip: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  dot: { width: 8, height: 8, borderRadius: theme.radius.full },
  chipLabel: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.text },
  selectedLabel: { ...theme.typography.label, color: theme.colors.primaryDark },
  pressed: { opacity: 0.7 },
});
