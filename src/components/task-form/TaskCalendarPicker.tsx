import { openSettings } from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { selectDeviceCalendars } from '@/calendar/deviceCalendar';
import Button from '@/components/ui/Button';
import OptionCard from '@/components/ui/OptionCard';
import { theme } from '@/constants/theme';
import type { TaskCalendar } from '@/types/calendar';

type Props = {
  value?: TaskCalendar;
  onChange: (calendar: TaskCalendar | undefined) => void;
  disabled?: boolean;
};

export default function TaskCalendarPicker({ value, onChange, disabled }: Props) {
  const [calendars, setCalendars] = useState<TaskCalendar[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const request = useRef(false);
  const supported = Platform.OS === 'android' || Platform.OS === 'ios';

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function chooseCalendar() {
    if (request.current) return;
    request.current = true;
    setLoading(true);
    setError('');
    try {
      const choices = await selectDeviceCalendars();
      if (!mounted.current) return;
      setCalendars(choices);
      setChoosing(choices.length > 0);
      if (!choices.length) setError('No hay calendarios compatibles para escribir. Añade una cuenta de calendario en el dispositivo y vuelve a intentar. Puedes continuar sin vincular la tarea.');
    } catch (cause) {
      if (!mounted.current) return;
      setError(cause instanceof Error ? cause.message : 'No pudimos leer tus calendarios. Puedes continuar sin vincular la tarea.');
      setChoosing(false);
    } finally {
      request.current = false;
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Añadir al calendario</Text>
        <Switch accessibilityLabel="Añadir al calendario" value={!!value || choosing || loading}
          disabled={!supported || disabled || loading} trackColor={{ true: theme.colors.primary }}
          onValueChange={(enabled) => {
            setError('');
            if (enabled) void chooseCalendar();
            else { onChange(undefined); setChoosing(false); }
          }} />
      </View>
      <Text style={styles.caption}>{supported
        ? 'Opcional. El evento ocupará los 30 minutos anteriores a la hora límite y se actualizará con tu tarea.'
        : 'La vinculación con el calendario del dispositivo está disponible en Android e iOS. En la web puedes crear y editar tus tareas normalmente.'}</Text>
      {!!value && <Text style={styles.caption}>Calendario: {value.title}</Text>}
      {loading && <Text accessibilityLiveRegion="polite" style={styles.caption}>Buscando calendarios…</Text>}
      {choosing && !loading && (
        <View style={styles.choices} accessibilityLabel="Calendarios compatibles">
          <Text style={styles.label}>Elige un calendario</Text>
          {calendars.map((calendar) => (
            <OptionCard key={calendar.id} label={calendar.title} selected={value?.id === calendar.id}
              onPress={() => { if (!disabled) { onChange(calendar); setChoosing(false); } }} />
          ))}
        </View>
      )}
      {supported && !choosing && (!!value || !!error) && (
        <Button variant="secondary" label={value ? 'Cambiar calendario' : 'Reintentar calendario'}
          disabled={disabled || loading} onPress={() => void chooseCalendar()} />
      )}
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {supported && !!error && <Button variant="secondary" label="Abrir ajustes"
        disabled={disabled || loading} onPress={() => { void openSettings().catch(() => setError('No pudimos abrir los ajustes. Ábrelos desde tu dispositivo para revisar los permisos del calendario.')); }} />}
      {!!value && <Text style={styles.caption}>Al desactivar esta opción y guardar, se eliminará el evento vinculado.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...theme.surfaces.card, gap: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  label: { ...theme.typography.label, flexShrink: 1, color: theme.colors.text, fontSize: theme.text.body },
  caption: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.small },
  choices: { gap: theme.spacing.sm },
  error: { ...theme.typography.body, color: theme.colors.dangerInk, fontSize: theme.text.small },
});
