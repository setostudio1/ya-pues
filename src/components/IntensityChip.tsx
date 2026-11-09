import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Intensity } from '../types/tasks';
import { INTENSITY_LABELS } from '../utils/tasks';

const INTENSITY_COLORS = {
  low: theme.colors.intensityLow,
  medium: theme.colors.intensityMedium,
  high: theme.colors.intensityHigh,
};

export default function IntensityChip({ intensity, selected, onPress }: {
  intensity: Intensity; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      <View style={[styles.dot, { backgroundColor: INTENSITY_COLORS[intensity] }]} />
      <Text style={[styles.label, selected && styles.selectedLabel]}>{INTENSITY_LABELS[intensity]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexBasis: 88, flexGrow: 1, minHeight: 44, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.sm, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 },
  selected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  dot: { width: 8, height: 8, borderRadius: theme.radius.full },
  label: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.text },
  selectedLabel: { ...theme.typography.label, color: theme.colors.primaryDark, textDecorationLine: 'underline' },
  pressed: { opacity: 0.7 },
});
