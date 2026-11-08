import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import RouteScreen from '../../components/RouteScreen';
import { theme } from '../../constants/theme';
import { useStoredTasks } from '../../hooks/useStoredTasks';
import { calculateProgress } from '../../utils/tasks';

export default function Streak() {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const progress = calculateProgress(tasks, completions);

  return (
    <RouteScreen title="Racha" description="Tu progreso, tarea a tarea" hasTabBar>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { void reload(); }} />
        : tasks.length === 0 ? (
          <>
            <EmptyState message="Todavía no hay tareas para calcular tu progreso. Crea la primera." />
            <Link href="/set-date" asChild><Button label="Crear tarea" /></Link>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.total}>{progress.streak} {progress.streak === 1 ? 'día' : 'días'}</Text>
              <Text style={styles.text}>de racha actual</Text>
              <Text style={styles.text}>{progress.todayCount} tareas completadas hoy</Text>
            </View>
            {progress.completed === 0 && <EmptyState message="Completa tu primera tarea desde Inicio para comenzar tu racha." />}
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.heading}>Progreso total</Text>
              <Text style={styles.text}>{progress.completed} de {progress.total} tareas completadas · {progress.percentage}%</Text>
              <View accessibilityRole="progressbar" accessibilityLabel="Tareas completadas"
                accessibilityValue={{ min: 0, max: 100, now: progress.percentage }} style={styles.track}>
                <View style={[styles.fill, { width: `${progress.percentage}%` }]} />
              </View>
              <Text style={styles.text}>{progress.pending} pendientes</Text>
            </View>
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.heading}>Últimos 7 días</Text>
              <View style={styles.week}>
                {progress.week.map((day) => <View key={day.date} style={[styles.day, day.count > 0 && styles.activeDay]}>
                  <Text style={styles.text}>{day.date.slice(8)}/{day.date.slice(5, 7)}</Text>
                  <Text accessibilityLabel={`${day.count} tareas el ${day.date}`} style={styles.count}>{day.count}</Text>
                </View>)}
              </View>
            </View>
          </>
        )}
    </RouteScreen>
  );
}

const styles = StyleSheet.create({
  card: { padding: theme.spacing.lg, gap: theme.spacing.md, backgroundColor: theme.colors.card, borderRadius: theme.radius.lg },
  total: { color: theme.colors.primary, fontSize: theme.text.display, fontWeight: 'bold' },
  heading: { color: theme.colors.text, fontSize: theme.text.heading, fontWeight: '600' },
  text: { color: theme.colors.textMuted, fontSize: theme.text.small, lineHeight: 22 },
  track: { height: 12, borderRadius: theme.radius.full, backgroundColor: theme.colors.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary },
  week: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  day: { padding: theme.spacing.sm, minWidth: 48, borderRadius: theme.radius.md, alignItems: 'center' },
  activeDay: { backgroundColor: theme.colors.primarySoft },
  count: { color: theme.colors.primary, fontSize: theme.text.heading, fontWeight: 'bold' },
});
