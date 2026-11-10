import { StyleSheet, Text, View } from 'react-native';

import CompanionAvatars from '@/components/home/CompanionAvatars';
import TaskCardActions from '@/components/home/TaskCardActions';
import { INTENSITY_LABELS, PROOF_LABELS } from '@/constants/tasks';
import { theme } from '@/constants/theme';
import type { Task, TaskStatus } from '@/types/tasks';

type Props = {
  task: Task;
  status: TaskStatus;
  busy: boolean;
  disabled: boolean;
  onComplete: () => void;
  onDelete: () => void;
};

export default function TaskCard({ task, status, busy, disabled, onComplete, onDelete }: Props) {
  const date = task.dueDate.split('-').reverse().join('/');
  const isCompleted = status === 'completed' || status === 'completedLate';
  const isOverdue = status === 'overdue';
  const textStyle = (isCompleted || isOverdue) && styles.darkText;

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timeColumn}>
        <Text accessibilityLabel={`Hora límite ${task.dueTime}`} style={styles.time}>{task.dueTime.replace(':', '.')}</Text>
      </View>
      <View style={[styles.card, isCompleted && styles.completedCard, isOverdue && styles.overdueCard]}>
        {isOverdue && <Text style={styles.overdueBadge}>Vencida</Text>}
        <Text accessibilityRole="header" style={[styles.title, textStyle]}>{task.title}</Text>
        <Text style={[styles.detail, textStyle]}>Límite: {date} a las {task.dueTime}</Text>
        <Text style={[styles.detail, textStyle]}>
          Intensidad: {INTENSITY_LABELS[task.intensity]} · Evidencia: {PROOF_LABELS[task.proofType]}
        </Text>
        <View style={styles.footer}>
          <TaskCardActions taskId={task.id} taskTitle={task.title} status={status} busy={busy} disabled={disabled}
            onComplete={onComplete} onDelete={onDelete} />
          <CompanionAvatars companions={task.companions ?? []} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  timeColumn: { width: 58, paddingTop: theme.spacing.md },
  time: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.caption, lineHeight: 20, fontVariant: ['tabular-nums'] },
  card: { flex: 1, minWidth: 0, backgroundColor: theme.colors.primary,
    padding: theme.spacing.md, gap: theme.spacing.sm, borderRadius: theme.radius.md },
  completedCard: { backgroundColor: theme.colors.mintSoft },
  overdueCard: { backgroundColor: theme.colors.coralSoft, borderWidth: 1, borderColor: theme.colors.coral },
  overdueBadge: { ...theme.typography.label, alignSelf: 'flex-start', color: theme.colors.dangerInk,
    fontSize: theme.text.caption, lineHeight: 18 },
  title: { ...theme.typography.label, color: theme.colors.card, fontSize: theme.text.small, lineHeight: 20 },
  detail: { ...theme.typography.body, color: theme.colors.card, fontSize: theme.text.caption, lineHeight: 18 },
  darkText: { color: theme.colors.text },
  footer: { flexDirection: theme.directions.taskCardFooter, alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.sm },
});
