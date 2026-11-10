import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import Button from '@/components/ui/Button';
import RouteScreen from '@/components/ui/RouteScreen';

const RETURN_HOME_DELAY_MS = 1700;

function goHome() {
  router.dismissTo('/');
}

export default function TaskCreatedScreen() {
  useFocusEffect(useCallback(() => {
    const timer = setTimeout(goHome, RETURN_HOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, []));

  return (
    <RouteScreen title="Tarea creada" description="Ahora depende de ti" hideBackButton>
      <Button label="Volver al inicio" onPress={goHome} />
    </RouteScreen>
  );
}
