import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { theme } from '@/constants/theme';
import type { RouteAction } from '@/types/navigation';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: readonly RouteAction[];
  children?: ReactNode;
  hasTabBar?: boolean;
};

export default function RouteScreen({ title, subtitle, description, actions = [], children, hasTabBar = false }: Props) {
  return (
    <Screen hasTabBar={hasTabBar}>
      {!hasTabBar && <BackButton />}
      <ScreenHeader title={title} subtitle={subtitle} description={description} />
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <Link key={action.label} href={action.href} dismissTo={action.dismissTo} asChild>
            <Button label={action.label} variant={index === 0 ? 'primary' : 'secondary'} />
          </Link>
        ))}
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: theme.spacing.lg },
});
