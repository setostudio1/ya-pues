import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import BottomNav from '@/components/ui/BottomNav';
import { theme } from '@/constants/theme';

export const unstable_settings = { anchor: 'index' };

function iconColor(color: unknown): string {
  return typeof color === 'string' ? color : theme.colors.primary;
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={iconColor(color)} size={size} />,
      }} />
      <Tabs.Screen name="streak" options={{
        title: 'Racha',
        tabBarIcon: ({ color, size }) => <Ionicons name="person" color={iconColor(color)} size={size} />,
      }} />
      <Tabs.Screen name="task-created" options={{ title: 'Tarea creada' }} />
    </Tabs>
  );
}
