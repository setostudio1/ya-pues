import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../src/constants/theme';

export default function Index() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});