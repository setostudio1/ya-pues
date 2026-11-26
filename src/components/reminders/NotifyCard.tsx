import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import {
  requestReminderPermission, scheduleSavedTaskReminders, taskReminderAvailability,
} from '@/notifications/taskReminders';

type Status = 'checking' | 'idle' | 'scheduled' | 'denied' | 'disabled' | 'error';

type Props = {
  taskId?: string;
  onAnswered: () => void;
};

export default function NotifyCard({ taskId, onAnswered }: Props) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let active = true;
    async function checkReminders() {
      try {
        const availability = await taskReminderAvailability();
        if (availability === 'enabled' && taskId) await scheduleSavedTaskReminders(taskId);
        if (!active) return;
        setStatus(availability === 'enabled' ? 'scheduled' : availability === 'disabled' ? 'disabled' : 'idle');
        if (availability === 'enabled') onAnswered();
      } catch {
        if (active) setStatus('error');
      }
    }
    void checkReminders();
    return () => { active = false; };
  }, [onAnswered, taskId]);

  const handlePress = async () => {
    setStatus('checking');
    try {
      if (!(await requestReminderPermission())) {
        setStatus('denied');
        return;
      }
      if (taskId) await scheduleSavedTaskReminders(taskId);
      setStatus('scheduled');
      onAnswered();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'scheduled') {
    return (
      <View style={styles.card}>
        <Ionicons name="notifications" size={24} color={theme.colors.primary} />
        <Text style={styles.text}>Listo, programamos los avisos de tu tarea.</Text>
      </View>
    );
  }

  if (status === 'denied' || status === 'disabled' || status === 'error') {
    return (
      <View style={styles.card}>
        <Ionicons name="notifications-off-outline" size={24} color={theme.colors.textMuted} />
        <Text style={styles.text}>{status === 'disabled'
          ? 'Los avisos de tareas están desactivados en Ya Pues.'
          : status === 'denied'
            ? 'Activa las notificaciones de Ya Pues en los ajustes del dispositivo.'
            : 'Guardamos tu tarea, pero no pudimos programar todos sus avisos.'}</Text>
      </View>
    );
  }

  if (status === 'checking') return null;

  return (
    <View style={styles.card}>
      <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
      <View style={styles.info}>
        <Text style={styles.title}>¿Quieres que te recordemos esta tarea?</Text>
        <Text style={styles.text}>Activa las notificaciones para recibir los avisos que elegiste.</Text>
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
