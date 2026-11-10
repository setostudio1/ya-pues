import { StyleSheet, Text, View } from 'react-native';

import DatePickerColumn from '@/components/task-form/DatePickerColumn';
import { HOURS, MINUTES } from '@/constants/tasks';
import { theme } from '@/constants/theme';
import { isTime } from '@/utils/tasks';

export default function TimeSelector({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [hour, minute] = (isTime(value) ? value : '12:00').split(':');
  return (
    <View style={styles.picker}>
      <DatePickerColumn items={HOURS} value={hour} label="Hora" onChange={(next) => onChange(`${next}:${minute}`)} />
      <Text style={styles.separator}>:</Text>
      <DatePickerColumn items={MINUTES} value={minute} label="Minuto" onChange={(next) => onChange(`${hour}:${next}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  separator: { ...theme.typography.body, fontSize: theme.text.title, lineHeight: 36, color: theme.colors.textMuted, paddingBottom: 4 },
});
