import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import ScreenHeader from '../../components/ScreenHeader';
import TaskCard from '../../components/TaskCard';
import { theme } from '../../constants/theme';
import { useStoredTasks } from '../../hooks/useStoredTasks';
import { recordCompletion } from '../../storage/data';

export default function Index() {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
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
      await reload();
    } catch {
      setSaveError('No pudimos guardar la completación. Tu tarea sigue aquí; vuelve a intentarlo.');
    } finally {
      completionLock.current = false;
      setCompletingId(null);
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.content}>
        <FlatList
          style={styles.list}
          data={loading || error ? [] : tasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.section}>
              <ScreenHeader title="Inicio" description="Buen día. ¿Qué tienes que hacer hoy?" />
              <Link href="/set-date" asChild><Button label="Crear tarea" /></Link>
              <Text accessibilityRole="header" style={styles.heading}>Tus tareas</Text>
              {loading && <LoadingState />}
              {!!error && <ErrorState message={error} onRetry={() => { void reload(); }} />}
              {!!saveError && <ErrorState message={saveError} />}
            </View>
          }
          ListEmptyComponent={!loading && !error
            ? <EmptyState message="Todavía no tienes tareas. Crea la primera para empezar." /> : null}
          renderItem={({ item }) => <TaskCard task={item} completed={completedIds.has(item.id)}
            busy={completingId === item.id} disabled={completingId !== null}
            onComplete={() => { void completeTask(item.id); }} />}
          ListFooterComponent={
            <View style={styles.footer}>
              <Link href="/notification-1" asChild><Button label="Recordatorio de tarea" variant="secondary" /></Link>
              <Link href="/notification-3" asChild><Button label="Tarea por vencer" variant="secondary" /></Link>
              <Link href="/start-page" asChild><Button label="Acceder a mi cuenta" variant="secondary" /></Link>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  list: { flex: 1, width: '100%' },
  listContent: { gap: theme.spacing.lg, flexGrow: 1 },
  section: { gap: theme.spacing.lg },
  heading: { color: theme.colors.text, fontSize: theme.text.heading, fontWeight: '600' },
  footer: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
});
