import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../constants/theme';

type Props = ComponentProps<typeof Pressable> & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export default function Button({ label, variant = 'primary', style, disabled, accessibilityState, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={(state) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
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
    minHeight: 54, justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryDark,
    borderWidth: 0, borderBottomWidth: theme.border.buttonDepth,
    paddingVertical: 14, paddingHorizontal: theme.spacing.xl, borderRadius: theme.radius.full,
  },
  pressed: { transform: [{ translateY: 1 }], opacity: 0.85 },
  secondary: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderBottomWidth: 1 },
  disabled: { backgroundColor: theme.colors.disabled, borderColor: theme.colors.disabled, opacity: 0.6 },
  secondaryLabel: { color: theme.colors.textMutedStrong },
  label: { ...theme.typography.label, fontSize: theme.text.body, lineHeight: 24, textAlign: 'center', color: theme.colors.card },
});
