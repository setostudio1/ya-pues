import { router } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import Button from '@/components/ui/Button';
import { useSession } from '@/context/SessionContext';
import { firstName } from '@/utils/auth';

export default function WelcomeScreen() {
  const { user } = useSession();
  const greeting = user ? `¡Hola, ${firstName(user.name)}!` : '¡Hola!';

  return (
    <AuthScreen title={greeting} subtitle="Tu siguiente meta empieza hoy." highlightTitle>
      <Button label="Continuar" onPress={() => router.replace('/')} />
    </AuthScreen>
  );
}
