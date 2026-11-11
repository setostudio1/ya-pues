import { Link } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export default function StartPageScreen() {
  return (
    <AuthScreen title="YA PUES" subtitle="Organiza tus tareas y cumple tus metas" highlightTitle>
      <Link href={ROUTES.login} asChild><Button label="Iniciar sesión" /></Link>
      <Link href={ROUTES.register} asChild><Button label="Crear cuenta" variant="secondary" /></Link>
    </AuthScreen>
  );
}
