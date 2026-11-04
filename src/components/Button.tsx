import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

type Props = ComponentProps<typeof Pressable> & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export default function Button({ label, variant = 'primary', style, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={(state) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
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

  secondary: {
    backgroundColor: theme.colors.primarySoft,
  },

  secondaryLabel: {
    color: theme.colors.primary,
  },

  label: {
    fontSize: theme.text.body,
    fontWeight: 'bold',
    color: theme.colors.card,
  },
});
