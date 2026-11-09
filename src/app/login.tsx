import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackButton from '../components/BackButton';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { theme } from '../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <BackButton style={styles.backButton} />
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <View style={styles.form}>
            <InputField
              label="Email"
              placeholder="tu.email@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <InputField
              label="Contraseña"
              placeholder="Tu contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Ingresar" variant="primary" onPress={() => router.push('/welcome')} />
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
  backButton: { position: 'absolute', top: theme.spacing.md, left: theme.spacing.xl, zIndex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  mascot: { width: 140, height: 140 },
  title: {
    ...theme.typography.title,
    fontSize: theme.text.title,
    color: theme.colors.text,
    textAlign: 'center',
  },
  form: { width: '100%', maxWidth: 480, gap: theme.spacing.lg },
  actions: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
