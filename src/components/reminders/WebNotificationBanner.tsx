import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WEB_REMINDER_ACCENTS } from '@/constants/reminders';
import { ROUTES } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { playWebFeedback, unlockWebAudio } from '@/notifications/webFeedback';
import { restoreWebDailyReminder, subscribeWebNotifications, type WebNotification } from '@/notifications/webReminders';

const VISIBLE_MS = 8000;

type Shown = { notification: WebNotification; key: number };

export default function WebNotificationBanner() {
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState<Shown | null>(null);

  useEffect(() => {
    void restoreWebDailyReminder().catch(() => undefined);
    window.addEventListener('pointerdown', unlockWebAudio);
    window.addEventListener('keydown', unlockWebAudio);
    const unsubscribe = subscribeWebNotifications((notification) => {
      setShown({ notification, key: Date.now() });
      playWebFeedback(notification.kind);
    });
    return () => {
      unsubscribe();
      window.removeEventListener('pointerdown', unlockWebAudio);
      window.removeEventListener('keydown', unlockWebAudio);
    };
  }, []);

  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(() => setShown(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  function open(notification: WebNotification) {
    setShown(null);
    if (notification.route) {
      const params = notification.taskId ? { taskId: notification.taskId } : { preview: '1' };
      router.push({ pathname: notification.route, params });
    } else {
      router.navigate(ROUTES.home);
    }
  }

  if (!shown) return null;
  const { notification } = shown;
  const accent = WEB_REMINDER_ACCENTS[notification.kind];

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + theme.spacing.sm }]}>
      <Animated.View key={shown.key} entering={FadeInDown} exiting={FadeOutUp}
        accessibilityRole="alert" aria-live="assertive" style={[styles.banner, { borderLeftColor: accent.color }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Abrir aviso: ${notification.title}`}
          onPress={() => open(notification)} style={styles.content}>
          <Ionicons name={accent.icon} size={24} color={accent.color} />
          <View style={styles.texts}>
            <Text style={styles.app}>YA PUES · ahora</Text>
            <Text numberOfLines={2} style={styles.title}>{notification.title}</Text>
            <Text numberOfLines={1} style={styles.body}>{notification.body}</Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar aviso" hitSlop={8}
          onPress={() => setShown(null)} style={styles.close}>
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, zIndex: 1000, alignItems: 'center',
    paddingHorizontal: theme.spacing.md },
  banner: { width: '100%', maxWidth: theme.layout.formMaxWidth, flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderLeftWidth: 4,
    borderWidth: 1, borderColor: theme.colors.border, paddingLeft: theme.spacing.md,
    boxShadow: theme.effects.banner },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    paddingVertical: theme.spacing.md, minHeight: 64 },
  texts: { flex: 1, gap: 2 },
  app: { ...theme.typography.caption, fontSize: theme.text.caption, color: theme.colors.textMuted },
  title: { ...theme.typography.label, fontSize: theme.text.small, color: theme.colors.text },
  body: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.textMutedStrong },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
