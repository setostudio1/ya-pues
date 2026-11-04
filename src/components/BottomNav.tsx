import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '../constants/theme';

export default function BottomNav({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const routes = state.routes.filter((route) => route.name !== 'task-created');

  return (
    // Normal document flow reserves the bar height, including its raised button.
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.border} />
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
        {routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const focused = state.routes[state.index].key === route.key;
          const color = focused
            ? options.tabBarActiveTintColor ?? theme.colors.primary
            : options.tabBarInactiveTintColor ?? theme.colors.textMuted;

          return (
            <Fragment key={route.key}>
              {index === 1 && (
                <Link href="/set-date" asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Crear tarea"
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="add" size={24} color={theme.colors.primary} />
                  </Pressable>
                </Link>
              )}
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              >
                {options.tabBarIcon?.({ focused, color, size: 30 })}
              </Pressable>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 20, backgroundColor: theme.colors.card },
  border: {
    position: 'absolute', top: 20, left: 0, right: 0,
    borderTopWidth: 1, borderColor: theme.colors.navigationBorder,
  },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  tab: { minWidth: 72, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  addButton: {
    width: 75, height: 75, marginTop: -20, borderRadius: theme.radius.full,
    alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.accent,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
  },
  pressed: { opacity: 0.7 },
});
