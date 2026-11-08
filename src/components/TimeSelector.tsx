import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { isTime } from '../utils/tasks';
import DatePickerColumn from './DatePickerColumn';

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

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
  separator: { fontSize: theme.text.title, color: theme.colors.text, fontWeight: 'bold' },
});
