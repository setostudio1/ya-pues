import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/DataState';
import { theme } from '@/constants/theme';
import type { calculateProgress } from '@/utils/tasks';

type Progress = ReturnType<typeof calculateProgress>;

export default function StreakOverview({ progress }: { progress: Progress }) {
  return (
    <>
      <Text style={styles.text}>{progress.todayCount} tareas completadas hoy</Text>
      {progress.completed === 0 && <EmptyState message="Completa tu primera tarea desde Inicio para comenzar tu racha." />}
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Progreso total</Text>
        <Text style={styles.text}>
          {progress.completed} de {progress.total} tareas completadas · {progress.percentage}%
        </Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Tareas completadas"
          accessibilityValue={{ min: 0, max: 100, now: progress.percentage }} style={styles.track}>
          <View style={[styles.fill, { width: `${progress.percentage}%` }]} />
        </View>
        <Text style={styles.text}>{progress.pending} pendientes</Text>
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Últimos 7 días</Text>
        <View style={styles.week}>
          {progress.week.map((day) => (
            <View key={day.date} style={[styles.day, day.count > 0 && styles.activeDay]}>
              <Text style={styles.text}>{day.date.slice(8)}/{day.date.slice(5, 7)}</Text>
              <Text accessibilityLabel={`${day.count} tareas el ${day.date}`} style={styles.count}>{day.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
