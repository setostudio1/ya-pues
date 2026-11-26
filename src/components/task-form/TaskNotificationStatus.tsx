import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import {
  hasExactReminderPermission, requestExactReminderPermission, taskReminderAvailability,
} from '@/notifications/taskReminders';

const MESSAGES = {
  disabled: 'Los avisos de tareas están desactivados en Ya Pues.',
  denied: 'Las notificaciones de Ya Pues están desactivadas en los ajustes del dispositivo.',
  error: 'No pudimos comprobar los permisos de notificación.',
};

export default function TaskNotificationStatus() {
  const [status, setStatus] = useState<keyof typeof MESSAGES | null>(null);
  const [needsExactPermission, setNeedsExactPermission] = useState(false);
  const [opening, setOpening] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    async function refresh() {
      try {
        const availability = await taskReminderAvailability();
        const exact = availability === 'disabled' || await hasExactReminderPermission();
        if (active) {
          setStatus(availability === 'enabled' ? null : availability);
          setNeedsExactPermission(!exact);
        }
      } catch {
        if (active) setStatus('error');
      }
    }
    void refresh();
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => { active = false; listener.remove(); };
  }, []));

  async function openExactAlarmSettings() {
    setOpening(true);
    try {
      await requestExactReminderPermission();
      setNeedsExactPermission(!(await hasExactReminderPermission()));
    } catch {
      setStatus('error');
    } finally {
      setOpening(false);
    }
  }

  if (!status && !needsExactPermission) return null;
  return (
    <View style={styles.container}>
      {status && <Text accessibilityLiveRegion="polite" style={styles.text}>{MESSAGES[status]}</Text>}
      {needsExactPermission && (
        <>
          <Text style={styles.text}>Activa las alarmas exactas en Android para recibir los avisos a la hora elegida.</Text>
          <Button label="Activar alarmas exactas" variant="secondary"
            disabled={opening} onPress={() => void openExactAlarmSettings()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  text: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.small },
});
