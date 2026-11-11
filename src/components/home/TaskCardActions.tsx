import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { TaskStatus } from '@/types/tasks';

type Props = {
  taskId: string;
  taskTitle: string;
  status: TaskStatus;
  busy: boolean;
  disabled: boolean;
  onComplete: () => void;
  onDelete: () => void;
};

const COMPLETED_LABELS: Partial<Record<TaskStatus, string>> = {
  completed: 'Completada',
  completedLate: 'Completada fuera de plazo',
};

export default function TaskCardActions({ taskId, taskTitle, status, busy, disabled, onComplete, onDelete }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const isCompleted = status === 'completed' || status === 'completedLate';
  const isOverdue = status === 'overdue';
  const removeLabel = isCompleted ? 'Quitar' : 'Eliminar';
  const textStyle = (isCompleted || isOverdue) ? styles.darkText : styles.lightText;

  if (isConfirming) {
    return (
      <View style={styles.confirm}>
        <Text style={[styles.question, textStyle]}>¿{removeLabel} esta tarea?</Text>
        <View style={styles.row}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Sí, ${removeLabel.toLowerCase()} ${taskTitle}`}
            disabled={disabled} onPress={() => { setIsConfirming(false); onDelete(); }} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Sí</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="No, mantener la tarea"
            onPress={() => setIsConfirming(false)} style={[styles.confirmButton, styles.cancelButton]}>
            <Text style={[styles.confirmText, styles.cancelText]}>No</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${removeLabel} ${taskTitle}`}
        disabled={disabled} onPress={() => setIsConfirming(true)} style={styles.removeButton}>
        <Text style={[styles.removeText, textStyle]}>{removeLabel}</Text>
      </Pressable>
      {!isCompleted && (
        <Link href={{ pathname: ROUTES.editTask, params: { id: taskId } }} asChild>
          <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${taskTitle}`} disabled={disabled}
            style={styles.removeButton}>
            <Text style={[styles.removeText, textStyle]}>Editar</Text>
          </Pressable>
        </Link>
      )}
      <View style={styles.main}>
        {isCompleted ? (
          <Text style={[styles.completed, status === 'completedLate' && styles.completedLate]}>
            {COMPLETED_LABELS[status]}
          </Text>
        ) : (
          <Button label={busy ? 'Guardando…' : 'Completar tarea'}
            accessibilityLabel={`Completar ${taskTitle}`} disabled={disabled}
            accessibilityState={{ busy }} onPress={onComplete}
            style={[styles.completeButton, isOverdue && styles.overdueButton]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexGrow: 1, flexShrink: 1 },
  main: { flexGrow: 1, flexShrink: 1, minWidth: 0, alignItems: 'flex-end' },
  removeButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.xs },
  removeText: { ...theme.typography.label, fontSize: theme.text.caption, textDecorationLine: 'underline' },
  lightText: { color: theme.colors.card },
  darkText: { color: theme.colors.text },
  completeButton: { alignSelf: 'flex-end', minHeight: 44, borderBottomWidth: 0,
    backgroundColor: theme.colors.primaryDark, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  overdueButton: { backgroundColor: theme.colors.dangerInk },
  completed: { ...theme.typography.label, color: theme.colors.successInk, fontSize: theme.text.small,
    paddingVertical: theme.spacing.xs },
  completedLate: { color: theme.colors.dangerInk },
  confirm: { flexGrow: 1, gap: theme.spacing.xs },
  question: { ...theme.typography.label, fontSize: theme.text.small },
  confirmButton: { minHeight: 40, minWidth: 64, alignItems: 'center', justifyContent: 'center',
    borderRadius: theme.radius.full, backgroundColor: theme.colors.dangerInk, paddingHorizontal: theme.spacing.md },
  cancelButton: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  confirmText: { ...theme.typography.label, fontSize: theme.text.small, color: theme.colors.card },
  cancelText: { color: theme.colors.text },
});
