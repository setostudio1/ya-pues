import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import {
  hasNotificationPermission, requestReminderPermission, scheduleSavedTaskReminders,
} from '@/notifications/taskReminders';

type Status = 'idle' | 'scheduled' | 'denied';

type Props = {
  taskId?: string;
  onAnswered: () => void;
};

export default function NotifyCard({ taskId, onAnswered }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    hasNotificationPermission().then((granted) => {
      if (granted) {
        setStatus('scheduled');
        onAnswered();
      }
    });
  }, [onAnswered]);

  const handlePress = async () => {
    const allowed = await requestReminderPermission();
    if (!allowed) {
      setStatus('denied');
      onAnswered();
      return;
    }
    if (taskId) {
      await scheduleSavedTaskReminders(taskId);
    }
    setStatus('scheduled');
    onAnswered();
  };

  if (status === 'scheduled') {
    return (
      <View style={styles.card}>
        <Ionicons name="notifications" size={24} color={theme.colors.primary} />
        <Text style={styles.text}>Listo, te avisaremos antes del plazo.</Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.card}>
        <Ionicons name="notifications-off-outline" size={24} color={theme.colors.textMuted} />
        <Text style={styles.text}>Sin avisos. Puedes activarlos en los ajustes del celular.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
      <View style={styles.info}>
        <Text style={styles.title}>¿Quieres que te recordemos esta tarea?</Text>
        <Text style={styles.text}>Te avisamos antes de que venza el plazo.</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Avísame</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  info: { flex: 1, gap: theme.spacing.xs },
  title: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  text: { ...theme.typography.body, flexShrink: 1, fontSize: theme.text.small, color: theme.colors.textMuted },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  buttonText: { ...theme.typography.label, fontSize: theme.text.small, color: theme.colors.card },
});
