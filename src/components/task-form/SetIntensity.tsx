import { StyleSheet, Text, View } from 'react-native';

import IntensityChip from '@/components/task-form/IntensityChip';
import { INTENSITY_LEVELS } from '@/constants/tasks';
import { theme } from '@/constants/theme';
import type { Intensity } from '@/types/tasks';

type Props = {
  selected: Intensity;
  onSelect: (level: Intensity) => void;
};

export default function SetIntensity({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Intensidad</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad" style={styles.row}>
        {INTENSITY_LEVELS.map((level) => (
          <IntensityChip key={level} intensity={level} selected={selected === level}
            onPress={() => onSelect(level)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  label: { ...theme.typography.label, fontSize: theme.text.body, color: theme.colors.text },
  row: { flexDirection: theme.directions.intensityOptions, flexWrap: 'wrap', gap: theme.spacing.sm },
});
