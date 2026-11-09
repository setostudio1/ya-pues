import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Task } from '../storage/data';
import { INTENSITY_LABELS, PROOF_LABELS } from '../utils/tasks';
import Button from './Button';
import CompanionAvatars from './CompanionAvatars';

export default function TaskCard({ task, completed, busy, disabled, onComplete }: {
  task: Task; completed: boolean; busy: boolean; disabled: boolean; onComplete: () => void;
}) {
  const date = task.dueDate.split('-').reverse().join('/');
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timeColumn}>
        <Text accessibilityLabel={`Hora límite ${task.dueTime}`} style={styles.time}>{task.dueTime.replace(':', '.')}</Text>
      </View>
      <View style={[styles.card, completed && styles.completedCard]}>
        <Text accessibilityRole="header" style={[styles.title, completed && styles.completedText]}>{task.title}</Text>
        <Text style={[styles.detail, completed && styles.completedText]}>Límite: {date} a las {task.dueTime}</Text>
        <Text style={[styles.detail, completed && styles.completedText]}>Intensidad: {INTENSITY_LABELS[task.intensity]} · Evidencia: {PROOF_LABELS[task.proofType]}</Text>
        <View style={styles.footer}>
          <View style={styles.action}>
            {completed ? <Text style={styles.completed}>Completada</Text> : (
              <Button label={busy ? 'Guardando…' : 'Completar tarea'}
                accessibilityLabel={`Completar ${task.title}`} disabled={disabled}
                accessibilityState={{ busy }} onPress={onComplete} style={styles.completeButton} />
            )}
          </View>
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
  title: { ...theme.typography.label, color: theme.colors.card, fontSize: theme.text.small, lineHeight: 20 },
  detail: { ...theme.typography.body, color: theme.colors.card, fontSize: theme.text.caption, lineHeight: 18 },
  completedText: { color: theme.colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing.sm },
  action: { flexBasis: 140, flexGrow: 1, flexShrink: 1, minWidth: 0, alignItems: 'flex-end' },
  completeButton: { alignSelf: 'flex-end', minHeight: 44, borderBottomWidth: 0,
    backgroundColor: theme.colors.primaryDark, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  completed: { ...theme.typography.label, alignSelf: 'flex-start', color: theme.colors.successInk,
    fontSize: theme.text.small, paddingVertical: theme.spacing.xs },
});
