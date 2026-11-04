import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import RouteScreen from '../../components/RouteScreen';

export default function TaskCreated() {
  useFocusEffect(useCallback(() => {
    const timer = setTimeout(() => router.dismissTo('/'), 1700);
    return () => clearTimeout(timer);
  }, []));

  return (
    <RouteScreen
      title="Tarea creada"
      description="Ahora depende de ti"
      includeTopInset
      actions={[{ label: 'Volver al inicio', href: '/', dismissTo: true }]}
    />
  );
}
