import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../src/constants/theme';

export default function Index() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        {/* COMPONENTS */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
});