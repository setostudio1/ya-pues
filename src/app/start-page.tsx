import { Link } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import Button from '@/components/ui/Button';

export default function StartPageScreen() {
  return (
    <AuthScreen title="YA PUES" subtitle="Organiza tus tareas y cumple tus metas" highlightTitle>
      <Link href="/login" asChild><Button label="Iniciar sesión" /></Link>
      <Link href="/register" asChild><Button label="Crear cuenta" variant="secondary" /></Link>
    </AuthScreen>
  );
}
