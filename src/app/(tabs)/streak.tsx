import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/DataState';
import StreakHero from '../../components/StreakHero';
import WeeklyStreak from '../../components/WeeklyStreak';
import { theme } from '../../constants/theme';
import { useStoredTasks } from '../../hooks/useStoredTasks';
import { calculateProgress } from '../../utils/tasks';

export default function Streak() {
  const { tasks, completions, loading, error, reload } = useStoredTasks();
  const progress = calculateProgress(tasks, completions);

  return (
    <SafeAreaView nativeID="ya-streak-screen" edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View nativeID="ya-streak-content" style={styles.content}>
          <View nativeID="ya-streak-main" style={styles.main}>
            {!loading && !error && <>
              <StreakHero progress={progress} />
              <WeeklyStreak progress={progress} style={styles.weeklyCard} />
            </>}
          </View>
          <View nativeID="ya-streak-details" style={styles.details}>
            {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { void reload(); }} />
              : tasks.length === 0 ? (
                <>
                  <EmptyState message="Todavía no hay tareas para calcular tu progreso. Crea la primera." />
                  <Link href="/set-date" asChild><Button label="Crear tarea" /></Link>
                </>
              ) : (
                <>
                  <Text style={styles.text}>{progress.todayCount} tareas completadas hoy</Text>
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
            <Link href="/reminders-preview" asChild><Button label="Ver recordatorios" variant="secondary" /></Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.card },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 1040, alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl, gap: theme.spacing.xxxl },
  main: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center',
    paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xl, gap: theme.spacing.xl },
  weeklyCard: { alignSelf: 'center' },
  details: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: theme.spacing.lg },
  card: { ...theme.surfaces.card, gap: theme.spacing.md },
  heading: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.heading },
  text: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.small, lineHeight: 22 },
  track: { height: 12, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: theme.radius.full, backgroundColor: theme.colors.mint },
  week: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  day: { padding: theme.spacing.sm, minWidth: 56, flexGrow: 1, gap: theme.spacing.sm,
    borderRadius: theme.radius.md, alignItems: 'center', backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border },
  activeDay: { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent },
  count: { ...theme.typography.heading, color: theme.colors.text, fontSize: theme.text.subtitle },
});
