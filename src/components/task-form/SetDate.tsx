import { Pressable, StyleSheet, Text, View } from 'react-native';

import DatePickerColumn from '@/components/task-form/DatePickerColumn';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import { theme } from '@/constants/theme';
import { getPickerDate, updatePickerDate } from '@/utils/pickers';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MAX_YEAR = 9999;

type Props = {
  value: string;
  onChange: (date: string) => void;
  onContinue: () => void;
  error?: string;
};

export default function SetDate({ value, onChange, onContinue, error }: Props) {
  const { year, month, day } = getPickerDate(value);
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => String(index + 1));
  const isFirstYear = year <= currentYear;

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
        <Pressable accessibilityRole="button" accessibilityLabel="Año anterior" disabled={isFirstYear}
          onPress={() => onChange(updatePickerDate(value, { year: year - 1 }))}
          style={[styles.yearButton, isFirstYear && styles.disabled]}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.year}>Año {year}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Año siguiente" disabled={year >= MAX_YEAR}
          onPress={() => onChange(updatePickerDate(value, { year: year + 1 }))}
          style={styles.yearButton}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
    </TaskStepScreen>
  );
}

const styles = StyleSheet.create({
  datePicker: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.xl },
  yearPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg },
  yearButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: theme.radius.full },
  year: { ...theme.typography.body, fontSize: theme.text.small, color: theme.colors.textMutedStrong },
  arrow: { ...theme.typography.body, fontSize: theme.text.title, lineHeight: 36, color: theme.colors.primary },
  disabled: { opacity: 0.3 },
});
