import { Link } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useSession } from '@/context/SessionContext';
import { firstName } from '@/utils/auth';

export default function WelcomeScreen() {
  const { user } = useSession();
  const greeting = user ? `¡Hola, ${firstName(user.name)}!` : '¡Hola!';

  return (
    <AuthScreen title={greeting} subtitle="Tu siguiente meta empieza hoy." highlightTitle>
      <Link href={ROUTES.home} replace asChild><Button label="Continuar" /></Link>
    </AuthScreen>
  );
}
