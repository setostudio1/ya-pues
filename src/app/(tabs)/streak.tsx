import { Link } from 'expo-router';

import WeeklyStreak from '@/components/home/WeeklyStreak';
import StreakHero from '@/components/streak/StreakHero';
import StreakOverview from '@/components/streak/StreakOverview';
import Button from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/DataState';
import Screen from '@/components/ui/Screen';
import { useStoredTasks } from '@/hooks/useStoredTasks';
import { calculateProgress } from '@/utils/tasks';

export default function StreakScreen() {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const progress = calculateProgress(tasks, completions);
  const ready = !loading && !error;

  return (
    <Screen hasTabBar>
      {ready && <StreakHero progress={progress} />}
      {ready && <WeeklyStreak progress={progress} />}
      {loading && <LoadingState />}
      {!!error && <ErrorState message={error} onRetry={() => { void reload(); }} />}
      {ready && tasks.length === 0 && (
        <>
          <EmptyState message="Todavía no hay tareas para calcular tu progreso. Crea la primera." />
          <Link href="/set-date" asChild><Button label="Crear tarea" /></Link>
        </>
      )}
      {ready && tasks.length > 0 && <StreakOverview progress={progress} />}
      <Link href="/reminders-preview" asChild><Button label="Ver recordatorios" variant="secondary" /></Link>
    </Screen>
  );
}
