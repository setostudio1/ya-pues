import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import Button from './Button';

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

// Checkpoints 3 and 4 need navigable screens; their full forms come later.
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
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
  heading: { gap: theme.spacing.md },
  subtitle: { color: theme.colors.primary, fontSize: theme.text.small, fontWeight: '600' },
  title: { color: theme.colors.text, fontSize: theme.text.title, fontWeight: 'bold' },
  description: { color: theme.colors.textMuted, fontSize: theme.text.body, lineHeight: 24 },
  actions: { gap: theme.spacing.md },
});
