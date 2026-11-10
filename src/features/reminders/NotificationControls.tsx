import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Platform, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '../../components/Button';
import { ErrorState } from '../../components/DataState';
import InputField from '../../components/InputField';
import { theme } from '../../constants/theme';
import { useNotifications } from './NotificationsProvider';
import { validDailyTime } from './notificationPlan';
import { notificationService } from './notificationService';

export default function NotificationControls() {
  const { preferences, permission, scheduledCount, eligibleCount, busy, error, refresh, run } = useNotifications();
  const [draftTime, setDraftTime] = useState<{ hour: string; minute: string } | null>(null);
  const hour = draftTime?.hour ?? String(preferences.daily?.hour ?? 20).padStart(2, '0');
  const minute = draftTime?.minute ?? String(preferences.daily?.minute ?? 0).padStart(2, '0');
  const [notice, setNotice] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const validTime = /^\d{1,2}$/.test(hour) && /^\d{1,2}$/.test(minute) && validDailyTime(Number(hour), Number(minute));
  const unsupported = Platform.OS === 'web';

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function testNotification() {
    setNotice('');
    if (await run(notificationService.test)) setNotice('Aviso de prueba programado para dentro de 10 segundos. Puedes bloquear el celular.');
  }

  return (
    <View style={styles.section}>
      {unsupported ? <Text style={styles.text}>Los avisos del sistema funcionan en Android e iOS. Abre la app en tu celular para activarlos. Aquí puedes ver los diseños.</Text>
        : <Text style={styles.text}>{permission === 'granted' ? `${scheduledCount} avisos programados en este celular.`
          : permission === 'denied' ? 'Sin permiso para avisos. Habilítalos en Ajustes del celular.'
          : '¿Quieres que te recordemos tus tareas? El permiso se pide al activar un aviso.'}</Text>}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text accessibilityRole="header" style={styles.heading}>Avisos de tareas</Text>
          <Switch accessibilityLabel="Activar avisos de tareas" value={preferences.tasksEnabled}
            disabled={busy || unsupported} trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            onValueChange={(enabled) => { setNotice(''); void run(() => notificationService.setTasksEnabled(enabled)); }} />
        </View>
        <Text style={styles.text}>24 horas, 2 horas, 45 minutos y 15 minutos antes del plazo. Al completar una tarea se cancelan sus avisos. Posponer añade 10 minutos.</Text>
        <Text style={styles.text}>Si creas una tarea con menos de 24 horas, el primer aviso llega en un minuto, siempre antes del plazo. Los horarios que ya pasaron se omiten.</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text accessibilityRole="header" style={styles.heading}>Recordatorio diario</Text>
          <Switch accessibilityLabel="Activar recordatorio diario" value={preferences.daily !== null}
            disabled={busy || unsupported || (!preferences.daily && !validTime)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            onValueChange={(enabled) => { setNotice(''); void run(() => notificationService.setDaily(enabled
              ? { hour: Number(hour), minute: Number(minute) } : null)); }} />
        </View>
        <Text style={styles.text}>{preferences.daily
          ? `Te recordamos todos los días a las ${String(preferences.daily.hour).padStart(2, '0')}:${String(preferences.daily.minute).padStart(2, '0')}.`
          : 'Sin recordatorio diario. Elige a qué hora revisar tus tareas.'}</Text>
        <View style={styles.row}>
          <View style={styles.field}><InputField label="Hora (0–23)" value={hour} onChangeText={(value) => setDraftTime({ hour: value, minute })}
            keyboardType="number-pad" maxLength={2} editable={!busy && !unsupported} /></View>
          <View style={styles.field}><InputField label="Minutos (0–59)" value={minute} onChangeText={(value) => setDraftTime({ hour, minute: value })}
            keyboardType="number-pad" maxLength={2} editable={!busy && !unsupported} /></View>
        </View>
        {!validTime && <Text accessibilityRole="alert" style={styles.text}>Usa una hora de 0 a 23 y minutos de 0 a 59.</Text>}
        <Button label="Guardar recordatorio" disabled={busy || unsupported || !validTime}
          onPress={() => { setNotice(''); void run(() => notificationService.setDaily({ hour: Number(hour), minute: Number(minute) })); }} />
      </View>
      {eligibleCount > scheduledCount && <Text style={styles.text}>Se guardan los 60 avisos más próximos. Abre la app para incorporar los siguientes.</Text>}
      {!!error && <ErrorState message={error} onRetry={() => { void refresh(); }} />}
      {!!settingsError && <ErrorState message={settingsError} />}
      {!unsupported && permission === 'denied' && <Button label="Abrir ajustes del celular" variant="secondary" disabled={busy}
        onPress={() => { setSettingsError(''); void Linking.openSettings().catch(() => setSettingsError('No pudimos abrir Ajustes. Ábrelos desde tu celular.')); }} />}
      <Button label={busy ? 'Actualizando avisos…' : 'Probar aviso en 10 segundos'} variant="secondary"
        disabled={busy || unsupported} onPress={() => { void testNotification(); }} />
      {!!notice && <Text accessibilityLiveRegion="polite" style={styles.text}>{notice}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.lg },
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flexWrap: 'wrap' },
  heading: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.body, flex: 1, minWidth: 150 },
  text: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.small, lineHeight: 22 },
  field: { flex: 1, minWidth: 100 },
});
