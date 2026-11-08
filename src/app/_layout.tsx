import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../constants/colors';
import { TaskDraftProvider } from '../context/TaskDraftContext';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function RootLayout() {
  return (
    <TaskDraftProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.card },
        contentStyle: { backgroundColor: colors.background },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="start-page" options={{ title: 'Acceso' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="welcome" options={{ title: 'Bienvenida' }} />
        <Stack.Screen name="set-date" options={{ title: 'Fecha límite' }} />
        <Stack.Screen name="set-time" options={{ title: 'Hora límite' }} />
        <Stack.Screen name="set-task" options={{ title: 'La tarea' }} />
        <Stack.Screen name="set-proof" options={{ title: 'La evidencia' }} />
        <Stack.Screen name="sign" options={{ title: 'El compromiso' }} />
        <Stack.Screen name="notification-1" options={{ title: 'Recordatorio' }} />
        <Stack.Screen name="notification-2" options={{ title: 'Tarea pospuesta' }} />
        <Stack.Screen name="notification-3" options={{ title: 'Plazo próximo' }} />
        <Stack.Screen name="notification-4" options={{ title: 'Aviso urgente' }} />
      </Stack>
    </TaskDraftProvider>
  );
}
