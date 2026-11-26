import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AdvanceReminderPicker from '@/components/task-form/AdvanceReminderPicker';
import DateWheels from '@/components/task-form/DateWheels';
import FillForm from '@/components/task-form/FillForm';
import SetIntensity from '@/components/task-form/SetIntensity';
import StepLabel from '@/components/task-form/StepLabel';
import TimeSelector from '@/components/task-form/TimeSelector';
import TaskCalendarPicker from '@/components/task-form/TaskCalendarPicker';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import InputField from '@/components/ui/InputField';
import Screen from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import type { AdvanceReminder, Task, TaskUpdate } from '@/types/tasks';

type Props = {
  task: Task;
  isOverdue: boolean;
  busy: boolean;
  error: string;
  onSave: (changes: TaskUpdate) => void;
};

export default function EditTask({ task, isOverdue, busy, error, onSave }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [calendar, setCalendar] = useState(task.calendar);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime);
  const [advanceReminder, setAdvanceReminder] = useState<AdvanceReminder>(task.advanceReminder ?? { kind: 'none' });
  const [intensity, setIntensity] = useState(task.intensity);

  return (
    <Screen>
      <BackButton />
      <StepLabel step="Editar tarea" title="Ajusta tu compromiso"
        description={isOverdue
          ? 'Esta tarea venció. Elige una nueva fecha y hora para retomarla.'
          : 'Cambia lo que necesites y guarda.'} />

      <View style={styles.section}>
        <Text style={styles.label}>La tarea</Text>
        <FillForm value={title} onChangeText={setTitle} />
        <InputField label="Descripción (opcional)" value={description} onChangeText={setDescription}
          placeholder="Añade detalles de tu tarea" multiline maxLength={2000} editable={!busy} />
        <SetIntensity selected={intensity} onSelect={setIntensity} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Fecha límite</Text>
        <DateWheels value={dueDate} onChange={setDueDate} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Hora límite</Text>
        <TimeSelector value={dueTime} onChange={setDueTime} />
      </View>

      <AdvanceReminderPicker value={advanceReminder} onChange={setAdvanceReminder} disabled={busy} />
      <TaskCalendarPicker value={calendar} onChange={setCalendar} disabled={busy} />
      {!!error && <ErrorState message={error} />}
      <Button label={busy ? 'Guardando…' : 'Guardar cambios'} disabled={busy} accessibilityState={{ busy }}
        onPress={() => onSave({ title: title.trim(), description: description.trim(), calendar, dueDate, dueTime, intensity, advanceReminder })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.md },
  label: { ...theme.typography.label, color: theme.colors.text, fontSize: theme.text.small },
});
