import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Task } from '../storage/data';
import { INTENSITY_LABELS, PROOF_LABELS } from '../utils/tasks';
import Button from './Button';

export default function TaskCard({ task, completed, busy, disabled, onComplete }: {
  task: Task; completed: boolean; busy: boolean; disabled: boolean; onComplete: () => void;
}) {
  const date = task.dueDate.split('-').reverse().join('/');
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>{task.title}</Text>
      <Text style={styles.detail}>Límite: {date} a las {task.dueTime}</Text>
      <Text style={styles.detail}>Intensidad: {INTENSITY_LABELS[task.intensity]} · Evidencia: {PROOF_LABELS[task.proofType]}</Text>
      {completed ? <Text style={styles.completed}>Completada</Text> : (
        <Button label={busy ? 'Guardando…' : 'Completar tarea'}
          accessibilityLabel={`Completar ${task.title}`} disabled={disabled}
          accessibilityState={{ busy }} onPress={onComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.spacing.lg, gap: theme.spacing.md, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg },
  title: { color: theme.colors.text, fontSize: theme.text.heading, fontWeight: 'bold' },
  detail: { color: theme.colors.textMuted, fontSize: theme.text.small, lineHeight: 22 },
  completed: { color: theme.colors.primary, fontSize: theme.text.body, fontWeight: '600' },
});
