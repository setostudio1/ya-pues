import { router } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import LoginForm from '@/components/auth/LoginForm';
import Button from '@/components/ui/Button';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import { signInWithPassword } from '@/storage/accounts';

export default function LoginScreen() {
  const { submitting, error, submit, clearError } = useAuthSubmit(signInWithPassword);

  return (
    <AuthScreen title="Iniciar sesión" subtitle="Qué bueno verte de nuevo" showBackButton>
      <LoginForm submitting={submitting} error={error} onSubmit={submit} onChange={clearError} />
      <Button label="¿No tienes cuenta? Crear cuenta" variant="secondary" disabled={submitting}
        onPress={() => router.replace('/register')} />
    </AuthScreen>
  );
}
