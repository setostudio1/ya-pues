import { useEffect, useState, type ReactNode } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import HomeReminders from '@/components/home/HomeReminders';
import TaskCard from '@/components/home/TaskCard';
import WeeklyStreak from '@/components/home/WeeklyStreak';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/DataState';
import { theme } from '@/constants/theme';
import type { Task, TaskCompletion } from '@/types/tasks';
import { calculateProgress, getTaskStatus } from '@/utils/tasks';

const REFRESH_INTERVAL_MS = 60 * 1000;

type Props = {
  header: ReactNode;
  tasks: Task[];
  allTasks: Task[];
  completions: TaskCompletion[];
  loading: boolean;
  error: string;
  saveError: string;
  busyId: string | null;
  onRetry: () => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

export default function HomeTaskList({
  header, tasks, allTasks, completions, loading, error, saveError, busyId, onRetry, onComplete, onDelete,
}: Props) {
  const ready = !loading && !error;
  const completedIds = new Set(completions.map((entry) => entry.taskId));
  const completionByTask = new Map(completions.map((entry) => [entry.taskId, entry]));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <FlatList
      style={styles.list}
      data={ready ? tasks : []}
      keyExtractor={(task) => task.id}
      extraData={now}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.section}>
          {header}
          {ready && <WeeklyStreak progress={calculateProgress(allTasks, completions)} />}
          <Text accessibilityRole="header" style={styles.heading}>Cronograma</Text>
          {loading && <LoadingState />}
          {!!error && <ErrorState message={error} onRetry={onRetry} />}
          {!!saveError && <ErrorState message={saveError} />}
        </View>
      }
      ListEmptyComponent={ready ? <EmptyState message="Todavía no tienes tareas. Crea la primera para empezar." /> : undefined}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100)}>
          <TaskCard task={item} status={getTaskStatus(item, completionByTask.get(item.id), now)} busy={busyId === item.id}
            disabled={busyId !== null} onComplete={() => onComplete(item.id)} onDelete={() => onDelete(item.id)} />
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
