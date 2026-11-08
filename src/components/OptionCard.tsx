import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

export default function OptionCard({ label, selected, onPress }: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 48, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, padding: theme.spacing.md, justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  selected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  label: { color: theme.colors.text, fontSize: theme.text.body },
  selectedLabel: { color: theme.colors.primary, fontWeight: 'bold' },
  pressed: { opacity: 0.7 },
});
