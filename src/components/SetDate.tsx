import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { getPickerDate, updatePickerDate } from '../utils/pickers';
import DatePickerColumn from './DatePickerColumn';
import TaskStepScreen from './TaskStepScreen';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

type Props = { value: string; onChange: (date: string) => void; onContinue: () => void; error?: string };

// Recovered from feature/screen-set-date and connected to the task draft.
export default function SetDate({ value, onChange, onContinue, error }: Props) {
  const { year, month, day } = getPickerDate(value);
  const currentYear = new Date().getFullYear();
  const days = useMemo(() => Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => String(index + 1)), [year, month]);

  return (
    <TaskStepScreen step="Paso 1 - Fecha Límite" title="¿Cuándo tiene que estar hecha esta tarea?"
      caption="Para cambiar la fecha" onContinue={onContinue} error={error}>
      <View style={styles.datePicker}>
        <DatePickerColumn items={days} value={String(day)} label="Día"
          onChange={(selectedDay) => onChange(updatePickerDate(value, { day: Number(selectedDay) }))} />
        <DatePickerColumn items={MONTHS} value={MONTHS[month]} label="Mes"
          onChange={(selectedMonth) => onChange(updatePickerDate(value, { month: MONTHS.indexOf(selectedMonth) }))} />
      </View>
      <View style={styles.yearPicker}>
        <Pressable accessibilityRole="button" accessibilityLabel="Año anterior" disabled={year <= currentYear}
          onPress={() => onChange(updatePickerDate(value, { year: year - 1 }))}
          style={[styles.yearButton, year <= currentYear && styles.disabled]}><Text style={styles.arrow}>‹</Text></Pressable>
        <Text accessibilityLabel={`Año ${year}`} style={styles.year}>Año {year}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Año siguiente" disabled={year >= 9999}
          onPress={() => onChange(updatePickerDate(value, { year: year + 1 }))}
          style={styles.yearButton}><Text style={styles.arrow}>›</Text></Pressable>
      </View>
    </TaskStepScreen>
  );
}

const styles = StyleSheet.create({
  datePicker: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.xl },
  yearPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg, marginTop: theme.spacing.lg },
  yearButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: theme.radius.full },
  year: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.textMutedStrong },
  arrow: { ...theme.typography.body, fontSize: theme.text.title, lineHeight: 36, color: theme.colors.primary },
  disabled: { opacity: 0.3 },
});
