import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { theme } from '../constants/theme';

type Props = ComponentProps<typeof Pressable> & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export default function Button({
  label,
  variant = 'primary',
  style,
  disabled,
  accessibilityState,
  onPress,
  ...props
}: Props) {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
    >
      {(state) => (
        <Animated.View
          style={[
            styles.button,
            variant === 'secondary' && styles.secondary,
            disabled && styles.disabled,
            {
              transform: [{ scale: state.pressed && !disabled ? 0.96 : 1 }],
              transitionProperty: 'transform',
              transitionDuration: 150,
            },
            typeof style === 'function' ? style(state) : style,
          ]}
        >
          <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>
            {label}
          </Text>
        </Animated.View>
      )}
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
  secondary: {
    backgroundColor: theme.colors.primarySoft,
  },
  disabled: {
    opacity: 0.5,
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
