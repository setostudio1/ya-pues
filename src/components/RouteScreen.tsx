import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import Button from './Button';
import ScreenHeader from './ScreenHeader';

type Action = {
  label: string;
  href: Href;
  dismissTo?: boolean;
};

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: Action[];
  children?: ReactNode;
  includeTopInset?: boolean;
};

export default function RouteScreen({
  title,
  subtitle,
  description,
  actions = [],
  children,
  includeTopInset = false,
}: Props) {
  return (
    <SafeAreaView
      edges={includeTopInset ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}
      style={styles.screen}
    >
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content}>
        <ScreenHeader title={title} subtitle={subtitle} description={description} />
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Link key={action.label} href={action.href} dismissTo={action.dismissTo} asChild>
              <Button label={action.label} variant={index === 0 ? 'primary' : 'secondary'} />
            </Link>
          ))}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  actions: { gap: theme.spacing.md },
});
