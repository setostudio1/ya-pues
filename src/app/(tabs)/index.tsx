import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '@/components/home/HomeHeader';
import HomeTaskList from '@/components/home/HomeTaskList';
import { theme } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';
import { useSignOut } from '@/hooks/useSignOut';
import { useStoredTasks } from '@/hooks/useStoredTasks';
import { useTaskCompletion } from '@/hooks/useTaskCompletion';
import { useTaskReminderSync } from '@/hooks/useTaskReminderSync';
import { firstName } from '@/utils/auth';

export default function HomeScreen() {
  const { user } = useSession();
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const signOut = useSignOut(tasks);
  useTaskReminderSync(tasks, completions, loading);
  const { completingId, saveError, completeTask } = useTaskCompletion(reload);

  return (
    <SafeAreaView nativeID="ya-home-screen" edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.content}>
        <HomeTaskList
          header={<HomeHeader name={firstName(user?.name ?? '')} onSignOut={() => { void signOut(); }} />}
          tasks={tasks}
          completions={completions}
          loading={loading}
          error={error}
          saveError={saveError}
          completingId={completingId}
          onRetry={() => { void reload(); }}
          onComplete={(taskId) => { void completeTask(taskId); }}
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
  },
});
