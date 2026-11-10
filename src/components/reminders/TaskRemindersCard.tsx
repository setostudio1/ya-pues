import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { scheduleTestReminder } from '@/notifications/taskReminders';
import type { ReminderResult } from '@/types/reminders';

const RESULT_MESSAGES: Record<ReminderResult, string> = {
  scheduled: 'Aviso de prueba programado para dentro de 10 segundos.',
  denied: 'No hay permiso para avisos. Actívalo en los ajustes del celular.',
  unsupported: 'Los avisos funcionan en el celular con Expo Go, no en el navegador.',
};

export default function TaskRemindersCard() {
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    const result = await scheduleTestReminder();
    setMessage(RESULT_MESSAGES[result]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Avisos de tareas</Text>
      <Text style={styles.text}>Cada tarea avisa 2 horas, 1 hora y 15 minutos antes del plazo.</Text>
      <Button label="Probar aviso en 10 segundos" variant="secondary" onPress={() => { void handleTest(); }} />
      {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  heading: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  text: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 21, color: theme.colors.textMutedStrong },
});
