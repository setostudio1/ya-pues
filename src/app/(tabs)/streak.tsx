import { Link } from 'expo-router';

import WeeklyStreak from '@/components/home/WeeklyStreak';
import StreakHero from '@/components/streak/StreakHero';
import StreakOverview from '@/components/streak/StreakOverview';
import Button from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/DataState';
import Screen from '@/components/ui/Screen';
import { ROUTES } from '@/constants/routes';
import { useStoredTasks } from '@/hooks/useStoredTasks';
import { calculateProgress } from '@/utils/tasks';

export default function StreakScreen() {
  const { allTasks, completions, loading, error, reload } = useStoredTasks();
  const progress = calculateProgress(allTasks, completions);
  const ready = !loading && !error;

  return (
    <Screen hasTabBar>
      {ready && <StreakHero progress={progress} />}
      {ready && <WeeklyStreak progress={progress} />}
      {loading && <LoadingState />}
      {!!error && <ErrorState message={error} onRetry={() => { void reload(); }} />}
      {ready && allTasks.length === 0 && (
        <>
          <EmptyState message="Todavía no hay tareas para calcular tu progreso. Crea la primera." />
          <Link href={ROUTES.setDate} asChild><Button label="Crear tarea" /></Link>
        </>
      )}
      {ready && allTasks.length > 0 && <StreakOverview progress={progress} />}
      <Link href={ROUTES.reminders} asChild><Button label="Ver recordatorios" variant="secondary" /></Link>
    </Screen>
  );
}
