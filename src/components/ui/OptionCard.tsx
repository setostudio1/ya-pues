import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

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
  option: { minHeight: 60, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingVertical: 16, paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center', backgroundColor: theme.colors.card },
  selected: { borderColor: theme.colors.primary, borderWidth: 2, paddingVertical: 15,
    paddingHorizontal: theme.spacing.lg - 1, backgroundColor: theme.colors.primarySoft },
  label: { ...theme.typography.body, color: theme.colors.text, fontSize: theme.text.body },
  selectedLabel: { ...theme.typography.label, color: theme.colors.primaryDark },
  pressed: { opacity: 0.7 },
});
