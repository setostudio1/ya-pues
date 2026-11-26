import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import TaskNotificationStatus from '@/components/task-form/TaskNotificationStatus';
import InputField from '@/components/ui/InputField';
import OptionCard from '@/components/ui/OptionCard';
import { theme } from '@/constants/theme';
import type { AdvanceReminder } from '@/types/tasks';

const OPTIONS = [
  { kind: 'none', label: 'Sin aviso previo' },
  { kind: 'five', label: '5 minutos antes' },
  { kind: 'ten', label: '10 minutos antes' },
  { kind: 'days', label: 'Días antes' },
] as const;

type Props = {
  value?: AdvanceReminder;
  onChange: (value: AdvanceReminder) => void;
  disabled?: boolean;
};

export default function AdvanceReminderPicker({ value, onChange, disabled }: Props) {
  const [days, setDays] = useState(value?.kind === 'days' ? String(value.days) : '');

  function changeDays(text: string) {
    setDays(text);
    onChange({ kind: 'days', days: /^\d+$/.test(text) ? Number(text) : 0 });
  }

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Avisarme antes</Text>
      {OPTIONS.map(({ kind, label }) => (
        <OptionCard key={kind} label={label} selected={(value?.kind ?? 'none') === kind}
          onPress={() => {
            if (disabled) return;
            if (kind === 'days') changeDays(days);
            else onChange({ kind });
          }} />
      ))}
      {value?.kind === 'days' && (
        <InputField label="Número de días (mínimo 1)" value={days} onChangeText={changeDays}
          keyboardType="number-pad" editable={!disabled} />
      )}
      <TaskNotificationStatus />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm },
  label: { ...theme.typography.label, color: theme.colors.text, fontSize: theme.text.small },
});
