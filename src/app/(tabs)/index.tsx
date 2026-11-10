import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import HomeHeader from '../../components/HomeHeader';
import HomeReminders from '../../components/HomeReminders';
import TaskCard from '../../components/TaskCard';
import WeeklyStreak from '../../components/WeeklyStreak';
import { theme } from '../../constants/theme';
import { useNotifications } from '../../features/reminders/NotificationsProvider';
import { useStoredTasks } from '../../hooks/useStoredTasks';
import { recordCompletion } from '../../storage/data';
import { calculateProgress } from '../../utils/tasks';

export default function Index() {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const { refresh: refreshNotifications, error: notificationError } = useNotifications();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const completionLock = useRef(false);
  const completedIds = new Set(completions.map((entry) => entry.taskId));

  async function completeTask(taskId: string) {
    if (completionLock.current) return;
    completionLock.current = true;
    setCompletingId(taskId);
    setSaveError('');
    try {
      await recordCompletion(taskId);
      await refreshNotifications();
      await reload();
    } catch {
      setSaveError('No pudimos guardar la completación. Tu tarea sigue aquí; vuelve a intentarlo.');
    } finally {
      completionLock.current = false;
      setCompletingId(null);
    }
  }

  return (
    <SafeAreaView nativeID="ya-home-screen" edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          nativeID="ya-home-list"
          style={styles.list}
          data={loading || error ? [] : tasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View nativeID="ya-home-header" style={styles.section}>
              <HomeHeader />
              {!loading && !error && <WeeklyStreak progress={calculateProgress(tasks, completions)} />}
              <Text accessibilityRole="header" style={styles.heading}>Cronograma</Text>
              {loading && <LoadingState />}
              {!!error && <ErrorState message={error} onRetry={() => { void reload(); }} />}
              {!!saveError && <ErrorState message={saveError} />}
              {!!notificationError && <ErrorState message={`Tus tareas se conservan. Hay un problema con los avisos: ${notificationError}`}
                onRetry={() => { void refreshNotifications(); }} />}
            </View>
          }
          ListEmptyComponent={!loading && !error
            ? <EmptyState message="Todavía no tienes tareas. Crea la primera para empezar." /> : undefined}
          renderItem={({ item }) => <TaskCard task={item} completed={completedIds.has(item.id)}
            busy={completingId === item.id} disabled={completingId !== null}
            onComplete={() => { void completeTask(item.id); }} />}
          ListFooterComponent={
            <View nativeID="ya-home-footer" style={styles.footer}>
              {!loading && !error && <HomeReminders tasks={tasks} completedIds={completedIds} />}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.card },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  list: { flex: 1, width: '100%', maxWidth: 1120 },
  listContent: { gap: theme.spacing.xl, flexGrow: 1 },
  section: { gap: theme.spacing.xl, marginBottom: theme.spacing.xs },
  heading: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.body, lineHeight: 24, marginTop: theme.spacing.sm },
  footer: { gap: theme.spacing.xxl, marginTop: theme.spacing.sm },
});
