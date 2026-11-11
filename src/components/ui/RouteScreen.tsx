import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { theme } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  hasTabBar?: boolean;
};

export default function RouteScreen({ title, subtitle, description, children, hasTabBar = false }: Props) {
  return (
    <Screen hasTabBar={hasTabBar}>
      {!hasTabBar && <BackButton />}
      <ScreenHeader title={title} subtitle={subtitle} description={description} />
      <View style={styles.sections}>{children}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: { flexDirection: theme.directions.screenSections, gap: theme.spacing.lg },
});
