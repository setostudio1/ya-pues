import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Task } from '../types/tasks';

export default function HomeReminders({ tasks, completedIds }: {
  tasks: Task[]; completedIds: ReadonlySet<string>;
}) {
  // This summary never removes tasks from the main list or changes their order.
  const reminders = tasks.filter((task) => !completedIds.has(task.id)).slice(0, 2);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>Recordatorio</Text>
        <Text style={styles.caption}>Tus compromisos pendientes</Text>
      </View>
      <View nativeID="ya-home-reminder-cards" style={styles.cards}>
        {reminders.map((task) => (
          <View key={task.id} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name="calendar" size={24} color={theme.colors.primary} accessible={false} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.deadline}>
                <Ionicons name="time" size={14} color={theme.colors.card} accessible={false} />
                <Text style={styles.deadlineText}>{task.dueDate.split('-').reverse().join('/')} · {task.dueTime}</Text>
              </View>
            </View>
          </View>
        ))}
        {reminders.length === 0 && <Text style={styles.caption}>No tienes tareas pendientes.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.md },
  heading: { gap: theme.spacing.xs },
  title: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.body, lineHeight: 24 },
  caption: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.caption, lineHeight: 20 },
  cards: { gap: theme.spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, minHeight: 72,
    backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm, padding: theme.spacing.sm },
  icon: { width: 48, height: 48, borderRadius: theme.radius.sm, backgroundColor: theme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs, paddingVertical: theme.spacing.xs },
  taskTitle: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 20, color: theme.colors.card },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  deadlineText: { ...theme.typography.body, flexShrink: 1, color: theme.colors.card, fontSize: theme.text.caption, lineHeight: 18 },
});
