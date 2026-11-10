import '../styles/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../constants/theme';
import { TaskDraftProvider } from '../context/TaskDraftContext';
import { NotificationsProvider } from '../features/reminders/NotificationsProvider';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  return (
    <TaskDraftProvider>
      <NotificationsProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="start-page" options={{ title: 'Acceso' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="welcome" options={{ title: 'Bienvenida' }} />
        <Stack.Screen name="set-date" options={{ title: 'Fecha límite' }} />
        <Stack.Screen name="set-time" options={{ title: 'Hora límite' }} />
        <Stack.Screen name="set-task" options={{ title: 'La tarea' }} />
        <Stack.Screen name="set-proof" options={{ title: 'La evidencia' }} />
        <Stack.Screen name="sign" options={{ title: 'El compromiso' }} />
        <Stack.Screen name="reminders-preview" options={{ title: 'Recordatorios' }} />
        <Stack.Screen name="notification-1" options={{ title: 'Recordatorio', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-2" options={{ title: 'Tarea pospuesta', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-3" options={{ title: 'Plazo próximo', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="notification-4" options={{ title: 'Aviso urgente', presentation: 'fullScreenModal' }} />
      </Stack>
      </NotificationsProvider>
    </TaskDraftProvider>
  );
}
