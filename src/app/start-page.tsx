import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { theme } from '../constants/theme';

export default function StartPageScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>YA PUES</Text>
          <Text style={styles.subtitle}>Organiza tus tareas y cumple tus metas</Text>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actions}>
          <Button label="Iniciar Sesión" variant="primary" onPress={() => router.push('/login')} />
          <Button label="Registrarse" variant="secondary" onPress={() => router.push('/login')} />
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
  mascot: { width: 140, height: 140, marginTop: theme.spacing.lg },
  actions: { gap: theme.spacing.md, width: '100%', maxWidth: 480, alignSelf: 'center' },
});
