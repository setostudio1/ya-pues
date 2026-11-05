import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Intensity } from '../types/tasks';
import { INTENSITY_LABELS } from '../utils/tasks';

export default function IntensityChip({ intensity, selected, onPress }: {
  intensity: Intensity; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      <View style={[styles.dot, selected && styles.selectedDot]} />
      <Text style={[styles.label, selected && styles.selectedLabel]}>{INTENSITY_LABELS[intensity]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexBasis: 88, flexGrow: 1, minHeight: 44, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.sm, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 },
  selected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  dot: { width: 12, height: 12, borderRadius: theme.radius.full, backgroundColor: theme.colors.textMuted },
  selectedDot: { backgroundColor: theme.colors.primary },
  label: { fontSize: theme.text.small, color: theme.colors.text },
  selectedLabel: { color: theme.colors.primary, fontWeight: 'bold' },
  pressed: { opacity: 0.7 },
});
