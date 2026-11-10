import '@/styles/global.css';

import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { theme } from '@/constants/theme';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { TaskDraftProvider } from '@/context/TaskDraftContext';
import { useReminderNavigation } from '@/notifications/useReminderNavigation';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  return (
    <SessionProvider>
      <TaskDraftProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </TaskDraftProvider>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useSession();
  const signedIn = user !== null;

  useReminderNavigation(!loading && signedIn);

  useEffect(() => {
    if (!loading) SplashScreen.hide();
  }, [loading]);

  if (loading) return null;

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.colors.background },
    }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="start-page" options={{ title: 'Acceso' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn} redirectTo="/start-page">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="set-date" options={{ title: 'Fecha límite' }} />
        <Stack.Screen name="set-time" options={{ title: 'Hora límite' }} />
        <Stack.Screen name="set-task" options={{ title: 'La tarea' }} />
        <Stack.Screen name="set-proof" options={{ title: 'La evidencia' }} />
        <Stack.Screen name="sign" options={{ title: 'El compromiso' }} />
        <Stack.Screen name="task-created" options={{ title: 'Tarea creada', gestureEnabled: false }} />
        <Stack.Screen name="reminders-preview" options={{ title: 'Recordatorios' }} />
        <Stack.Screen name="notification-1" options={{ title: 'Recordatorio', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-2" options={{ title: 'Tarea pospuesta', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-3" options={{ title: 'Plazo próximo', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-4" options={{ title: 'Aviso urgente', presentation: 'fullScreenModal' }} />
      </Stack.Protected>

      <Stack.Screen name="welcome" options={{ title: 'Bienvenida', gestureEnabled: false }} />
    </Stack>
  );
}
