import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { theme } from '@/constants/theme';
import { askNotificationPermission, cancelReminder, scheduleDailyReminder } from '@/notifications/notifications';
import { scheduleWebDailyReminder } from '@/notifications/webReminders';

function isValidNumber(value: string, max: number) {
  const number = Number(value);
  return value.trim() !== '' && Number.isInteger(number) && number >= 0 && number <= max;
}

export default function DailyReminderForm({ onSaved }: { onSaved: () => void }) {
  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('00');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const hourError = isValidNumber(hour, 23) ? '' : 'Escribe una hora de 0 a 23.';
  const minuteError = isValidNumber(minute, 59) ? '' : 'Escribe minutos de 0 a 59.';
  const isValid = !hourError && !minuteError;

  const handleSave = async () => {
    setIsSaving(true);
    const allowed = Platform.OS === 'web' || await askNotificationPermission();
    if (!allowed) {
      setMessage('Para guardar el recordatorio, activa los avisos en el celular.');
      setIsSaving(false);
      return;
    }
    await cancelReminder();
    if (Platform.OS === 'web') {
      await scheduleWebDailyReminder(Number(hour), Number(minute));
    } else {
      await scheduleDailyReminder(Number(hour), Number(minute));
    }
    setMessage('');
    setIsSaving(false);
    onSaved();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Horario del recordatorio</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <InputField label="Hora (0-23)" value={hour} onChangeText={setHour} keyboardType="number-pad" maxLength={2} />
          {!!hourError && <Text style={styles.error}>{hourError}</Text>}
        </View>
        <View style={styles.field}>
          <InputField label="Minutos (0-59)" value={minute} onChangeText={setMinute} keyboardType="number-pad" maxLength={2} />
          {!!minuteError && <Text style={styles.error}>{minuteError}</Text>}
        </View>
      </View>
      <Button label={isSaving ? 'Guardando…' : 'Guardar recordatorio'} disabled={!isValid || isSaving}
        onPress={() => { void handleSave(); }} />
      {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  heading: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  field: { flex: 1, gap: theme.spacing.xs },
  error: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.dangerInk },
  text: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.textMutedStrong },
});
