import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { cancelReminder, loadReminder, type Reminder } from '@/notifications/notifications';

function formatTime(reminder: Reminder) {
  return `${reminder.hour}:${String(reminder.minute).padStart(2, '0')}`;
}

export default function DailyReminderStatus() {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function fetchReminder() {
        const saved = await loadReminder();
        setReminder(saved);
        setIsLoading(false);
      }

      fetchReminder();
    }, []),
  );

  const handleTurnOff = async () => {
    await cancelReminder();
    setReminder(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.heading}>Recordatorio diario</Text>
        <Switch
          accessibilityLabel="Recordatorio diario"
          value={reminder !== null}
          disabled={reminder === null}
          onValueChange={(isOn) => { if (!isOn) void handleTurnOff(); }}
          trackColor={{ true: theme.colors.primary, false: theme.colors.disabled }}
        />
      </View>
      {!isLoading && reminder !== null && (
        <Text style={styles.text}>Te recordamos todos los días a las {formatTime(reminder)}.</Text>
      )}
      {!isLoading && reminder === null && (
        <Text style={styles.text}>No tienes un recordatorio diario. Elige un horario abajo.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, gap: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  heading: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  text: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.textMutedStrong },
});
