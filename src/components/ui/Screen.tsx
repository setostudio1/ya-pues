import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type Props = {
  children: ReactNode;
  hasTabBar?: boolean;
  centered?: boolean;
  narrow?: boolean;
};

export default function Screen({ children, hasTabBar = false, centered = false, narrow = false }: Props) {
  return (
    <SafeAreaView
      nativeID={hasTabBar ? 'ya-tab-screen' : 'ya-screen'}
      edges={hasTabBar ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      style={styles.screen}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[styles.content, centered && styles.centered, narrow && styles.narrow]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  centered: { justifyContent: 'center' },
  narrow: { maxWidth: theme.layout.formMaxWidth },
});
