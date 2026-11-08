import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Intensity } from '../types/tasks';
import IntensityChip from './IntensityChip';

type Props = {
  selected: Intensity;
  onSelect: (level: Intensity) => void;
};

export default function SetIntensity({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Intensidad</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad" style={styles.row}>
        {(['low', 'medium', 'high'] as const).map((level) => (
          <IntensityChip key={level} intensity={level} selected={selected === level}
            onPress={() => onSelect(level)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  label: { fontSize: theme.text.body, fontWeight: '600', color: theme.colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
