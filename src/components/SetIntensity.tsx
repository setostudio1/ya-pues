import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  selected: string;
  onSelect: (level: string) => void;
};

const OPTIONS = [
  { label: 'Leve', color: '#2E7032' },
  { label: 'Medio', color: '#E5A000' },
  { label: 'Alto', color: '#D32F2F' },
];

export default function SetIntensity({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Intensidad</Text>
      <View style={styles.row}>
        {OPTIONS.map((item) => {
          const isSelected = selected === item.label;
          return (
            <Pressable
              key={item.label}
              onPress={() => onSelect(item.label)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.chipText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.text.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.xs,
  },
  chipSelected: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    fontSize: theme.text.small,
    color: theme.colors.text,
  },
});