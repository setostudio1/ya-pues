import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { theme } from '../constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Tu siguiente meta empieza hoy.</Text>
        </View>

        <View style={styles.actions}>
          <Button label="Continuar" variant="primary" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  mascot: { width: 140, height: 140, marginBottom: theme.spacing.md },
  title: {
    ...theme.typography.display,
    fontSize: theme.text.display,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: theme.text.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  actions: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
