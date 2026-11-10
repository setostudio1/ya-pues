import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { askNotificationPermission } from '@/notifications/notifications';
import { cancelAllTaskReminders, scheduleTestReminder, syncSavedTaskReminders } from '@/notifications/taskReminders';
import { loadTaskRemindersEnabled, saveTaskRemindersEnabled } from '@/storage/preferences';
import type { ReminderResult } from '@/types/reminders';

const RESULT_MESSAGES: Record<ReminderResult, string> = {
  scheduled: 'Aviso de prueba programado para dentro de 10 segundos.',
  denied: 'No hay permiso para avisos. Actívalo en los ajustes del celular.',
  unsupported: 'Los avisos funcionan en el celular con Expo Go, no en el navegador.',
  disabled: 'Activa los avisos de tareas para recibirlos.',
  tooLate: 'Ya no hay tiempo para este aviso.',
};

export default function TaskRemindersCard() {
  const { user } = useSession();
  const [isEnabled, setIsEnabled] = useState(true);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function fetchPreference() {
        setIsEnabled(await loadTaskRemindersEnabled());
      }

      fetchPreference();
    }, []),
  );

  const handleToggle = async (enabled: boolean) => {
    if (enabled && !(await askNotificationPermission())) {
      setMessage(RESULT_MESSAGES[Platform.OS === 'web' ? 'unsupported' : 'denied']);
      return;
    }
    setIsEnabled(enabled);
    setMessage('');
    await saveTaskRemindersEnabled(enabled);
    if (enabled) {
      await syncSavedTaskReminders(user?.id);
    } else {
      await cancelAllTaskReminders();
    }
  };

  const handleTest = async () => {
    const result = await scheduleTestReminder();
    setMessage(RESULT_MESSAGES[result]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.heading}>Avisos de tareas</Text>
        <Switch
          accessibilityLabel="Avisos de tareas"
          value={isEnabled}
          onValueChange={(enabled) => { void handleToggle(enabled); }}
          trackColor={{ true: theme.colors.primary, false: theme.colors.disabled }}
        />
      </View>
      <Text style={styles.text}>
        {isEnabled
          ? 'Cada tarea avisa 24 horas, 2 horas, 45 minutos y 15 minutos antes del plazo.'
          : 'Los avisos de tareas están apagados.'}
      </Text>
      <Button label="Probar aviso en 10 segundos" variant="secondary" onPress={() => { void handleTest(); }} />
      {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  heading: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  text: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 21, color: theme.colors.textMutedStrong },
});
