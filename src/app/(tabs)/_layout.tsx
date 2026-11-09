import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import BottomNav from '../../components/BottomNav';
import { theme } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: 'Racha',
          tabBarIcon: ({ color, size }) => <Ionicons name="flame-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="task-created" options={{ href: null }} />
    </Tabs>
  );
}
