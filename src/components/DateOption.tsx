import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function DateOption({
  label,
  selected = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minWidth: 84,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selected: {
    backgroundColor: theme.colors.card,
  },

  pressed: {
    opacity: 0.7,
  },

  label: {
    fontSize: theme.text.title,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },

  selectedLabel: {
    color: theme.colors.text,
  },
});