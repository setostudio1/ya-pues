import { router } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import Button from '@/components/ui/Button';

export default function StartPageScreen() {
  return (
    <AuthScreen title="YA PUES" subtitle="Organiza tus tareas y cumple tus metas" highlightTitle>
      <Button label="Iniciar sesión" onPress={() => router.push('/login')} />
      <Button label="Crear cuenta" variant="secondary" onPress={() => router.push('/register')} />
    </AuthScreen>
  );
}
