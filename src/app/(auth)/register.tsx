import { Link } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import RegisterForm from '@/components/auth/RegisterForm';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import { registerAccount } from '@/storage/accounts';

export default function RegisterScreen() {
  const { submitting, error, submit, clearError } = useAuthSubmit(registerAccount);

  return (
    <AuthScreen title="Crear cuenta" subtitle="Empieza a cumplir tus compromisos" showBackButton>
      <RegisterForm submitting={submitting} error={error} onSubmit={submit} onChange={clearError} />
      <Link href={ROUTES.login} replace asChild>
        <Button label="¿Ya tienes cuenta? Iniciar sesión" variant="secondary" disabled={submitting} />
      </Link>
    </AuthScreen>
  );
}
