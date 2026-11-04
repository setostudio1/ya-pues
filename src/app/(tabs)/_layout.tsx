import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import BottomNav from '../../components/BottomNav';
import { colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
      }} />
      <Tabs.Screen name="streak" options={{
        title: 'Racha',
        tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
      }} />
      {/* The confirmation keeps the bar, but is not a third tab button. */}
      <Tabs.Screen name="task-created" options={{ title: 'Tarea creada', href: null }} />
    </Tabs>
  );
}
