import '@/styles/global.css';

import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import WebNotificationBanner from '@/components/reminders/WebNotificationBanner';
import { ROUTES } from '@/constants/routes';
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
    <>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)/start-page" options={{ title: 'Acceso' }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Iniciar sesión' }} />
          <Stack.Screen name="(auth)/register" options={{ title: 'Crear cuenta' }} />
        </Stack.Protected>

        <Stack.Protected guard={signedIn} redirectTo={ROUTES.startPage}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(new-task)/set-date" options={{ title: 'Fecha límite' }} />
          <Stack.Screen name="(new-task)/set-time" options={{ title: 'Hora límite' }} />
          <Stack.Screen name="(new-task)/set-task" options={{ title: 'La tarea' }} />
          <Stack.Screen name="(new-task)/set-proof" options={{ title: 'La evidencia' }} />
          <Stack.Screen name="(new-task)/sign" options={{ title: 'El compromiso' }} />
          <Stack.Screen name="edit-task/[id]" options={{ title: 'Editar tarea' }} />
          <Stack.Screen name="(reminders)/reminders-preview" options={{ title: 'Recordatorios' }} />
          <Stack.Screen name="(reminders)/notification-1" options={{ title: 'Recordatorio', presentation: 'fullScreenModal' }} />
          <Stack.Screen name="(reminders)/notification-2" options={{ title: 'Tarea pospuesta', presentation: 'fullScreenModal' }} />
          <Stack.Screen name="(reminders)/notification-3" options={{ title: 'Plazo próximo', presentation: 'fullScreenModal' }} />
          <Stack.Screen name="(reminders)/notification-4" options={{ title: 'Aviso urgente', presentation: 'fullScreenModal' }} />
        </Stack.Protected>

        <Stack.Screen name="welcome" options={{ title: 'Bienvenida', gestureEnabled: false }} />
      </Stack>
      {Platform.OS === 'web' && signedIn && <WebNotificationBanner />}
    </>
  );
}
