import type { ReactNode } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import HomeReminders from '@/components/home/HomeReminders';
import TaskCard from '@/components/home/TaskCard';
import WeeklyStreak from '@/components/home/WeeklyStreak';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/DataState';
import { theme } from '@/constants/theme';
import type { Task, TaskCompletion } from '@/types/tasks';
import { calculateProgress } from '@/utils/tasks';

type Props = {
  header: ReactNode;
  tasks: Task[];
  completions: TaskCompletion[];
  loading: boolean;
  error: string;
  saveError: string;
  completingId: string | null;
  onRetry: () => void;
  onComplete: (taskId: string) => void;
};

export default function HomeTaskList({
  header, tasks, completions, loading, error, saveError, completingId, onRetry, onComplete,
}: Props) {
  const ready = !loading && !error;
  const completedIds = new Set(completions.map((entry) => entry.taskId));

  return (
    <FlatList
      style={styles.list}
      data={ready ? tasks : []}
      keyExtractor={(task) => task.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.section}>
          {header}
          {ready && <WeeklyStreak progress={calculateProgress(tasks, completions)} />}
          <Text accessibilityRole="header" style={styles.heading}>Cronograma</Text>
          {loading && <LoadingState />}
          {!!error && <ErrorState message={error} onRetry={onRetry} />}
          {!!saveError && <ErrorState message={saveError} />}
        </View>
      }
      ListEmptyComponent={ready ? <EmptyState message="Todavía no tienes tareas. Crea la primera para empezar." /> : undefined}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(Math.min(index, 5) * 60).duration(300)}>
          <TaskCard task={item} completed={completedIds.has(item.id)} busy={completingId === item.id}
            disabled={completingId !== null} onComplete={() => onComplete(item.id)} />
        </Animated.View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          {ready && <HomeReminders tasks={tasks} completedIds={completedIds} />}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, width: '100%', maxWidth: theme.layout.maxWidth },
  listContent: { gap: theme.spacing.xl, flexGrow: 1, paddingBottom: theme.spacing.xl },
  section: { gap: theme.spacing.xl, marginBottom: theme.spacing.xs },
  heading: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.body, lineHeight: 24, marginTop: theme.spacing.sm },
  footer: { gap: theme.spacing.xxl, marginTop: theme.spacing.sm },
});
