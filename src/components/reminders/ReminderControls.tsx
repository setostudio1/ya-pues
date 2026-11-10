import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { theme } from '@/constants/theme';
import { cancelDailyReminder, scheduleDailyReminder, scheduleTestReminder } from '@/notifications/reminders';
import type { ReminderResult } from '@/types/reminders';
import { isTime } from '@/utils/tasks';

const RESULT_MESSAGES: Record<Exclude<ReminderResult, 'scheduled'>, string> = {
  denied: 'No hay permiso para avisos. Actívalo en los Ajustes del celular.',
  unsupported: 'Los avisos funcionan en el celular con Expo Go, no en el navegador.',
};

export default function ReminderControls() {
  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('00');
  const [message, setMessage] = useState('');

  async function testReminder() {
    const result = await scheduleTestReminder().catch(() => 'denied' as const);
    setMessage(result === 'scheduled' ? 'Aviso de prueba programado para dentro de 10 segundos.' : RESULT_MESSAGES[result]);
  }

  async function saveDailyReminder() {
    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    if (!isTime(time)) {
      setMessage('Usa una hora de 0 a 23 y minutos de 0 a 59.');
      return;
    }
    const result = await scheduleDailyReminder(Number(hour), Number(minute)).catch(() => 'denied' as const);
    setMessage(result === 'scheduled' ? `Recordatorio diario a las ${time}.` : RESULT_MESSAGES[result]);
  }

  async function removeDailyReminder() {
    await cancelDailyReminder();
    setMessage('Recordatorio diario desactivado.');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Avisos de tareas</Text>
      <Text style={styles.text}>Cada tarea avisa 2 horas, 1 hora y 15 minutos antes del plazo.</Text>
      <Button label="Probar aviso en 10 segundos" variant="secondary" onPress={() => { void testReminder(); }} />

      <Text style={styles.heading}>Recordatorio diario</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <InputField label="Hora (0-23)" value={hour} onChangeText={setHour} keyboardType="number-pad" maxLength={2} />
        </View>
        <View style={styles.field}>
          <InputField label="Minutos (0-59)" value={minute} onChangeText={setMinute} keyboardType="number-pad" maxLength={2} />
        </View>
      </View>
      <Button label="Guardar recordatorio diario" onPress={() => { void saveDailyReminder(); }} />
      <Button label="Quitar recordatorio diario" variant="secondary" onPress={() => { void removeDailyReminder(); }} />
      {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  heading: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  text: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 21, color: theme.colors.textMutedStrong },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  field: { flex: 1 },
});
