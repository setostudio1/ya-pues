import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function Button({ label, onPress }: Props) {
  return(
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  label: {
    fontSize: theme.text.body,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
});