import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  highlightTitle?: boolean;
  children: ReactNode;
};

export default function AuthScreen({ title, subtitle, showBackButton = false, highlightTitle = false, children }: Props) {
  return (
    <Screen centered narrow>
      {showBackButton && <BackButton fallbackHref="/start-page" />}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
        <Image source={require('@/assets/images/icon.png')} style={styles.mascot}
          resizeMode="contain" accessible={false} />
        <Text accessibilityRole="header" style={[styles.title, highlightTitle && styles.highlightTitle]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(150).duration(400)}>
        <View style={styles.body}>{children}</View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: theme.spacing.sm },
  mascot: { width: 120, height: 120, marginBottom: theme.spacing.md },
  title: { ...theme.typography.title, fontSize: theme.text.title, color: theme.colors.text, textAlign: 'center' },
  highlightTitle: { ...theme.typography.display, fontSize: theme.text.display, color: theme.colors.primary },
  subtitle: { ...theme.typography.body, fontSize: theme.text.body, color: theme.colors.textMuted, textAlign: 'center' },
  body: { gap: theme.spacing.md },
});
