import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '../constants/theme';
import { today, type calculateProgress } from '../utils/tasks';

type Props = {
  progress: Pick<ReturnType<typeof calculateProgress>, 'streak' | 'week'>;
  style?: StyleProp<ViewStyle>;
};

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const FLASH_FIRST = require('../../assets/images/streak/flash-first.svg');
const FLASH = require('../../assets/images/streak/flash.svg');
const FLASH_SMALL = require('../../assets/images/streak/flash-small.svg');

// Presentation only: the existing progress utility owns completion/streak rules.
export default function WeeklyStreak({ progress, style }: Props) {
  const now = new Date();
  const currentDate = today(now);
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const counts = new Map(progress.week.map((day) => [day.date, day.count]));
  const days = WEEKDAYS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = today(date);
    return { label, date, key, count: counts.get(key) ?? 0 };
  });

  return (
    <View style={[styles.card, style]}>
      <View style={styles.surface}>
        <View style={styles.week}>
          {days.map((day, index) => {
            const completed = day.count > 0;
            const isToday = day.key === currentDate;
            const start = completed && (index === 0 || days[index - 1].count === 0);
            const end = completed && (index === days.length - 1 || days[index + 1].count === 0);

            return (
              <View key={day.key} accessible
                accessibilityLabel={`${day.date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}${isToday ? ', hoy' : ''}: ${day.count} tareas completadas`}
                style={styles.day}>
                <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>{day.label}</Text>
                <View style={[styles.track, completed && styles.activeTrack, start && styles.runStart, end && styles.runEnd]}>
                  <View style={[styles.circle, isToday && styles.todayCircle, completed && styles.completedCircle]}>
                    {completed && <Image source={index === 0 ? FLASH_FIRST : FLASH}
                      contentFit="contain" accessible={false} style={styles.flash} />}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.summary}>
          <Image source={FLASH_SMALL} contentFit="contain" accessible={false} style={styles.summaryFlash} />
          <Text style={styles.summaryText}>
            {progress.streak > 0
              ? `${progress.streak} ${progress.streak === 1 ? 'día' : 'días'} cumpliendo tus tareas`
              : 'Completa una tarea y enciende tu racha'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 640, alignSelf: 'flex-start', backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl, boxShadow: theme.effects.streakCard },
  surface: { borderRadius: theme.radius.xl, overflow: 'hidden', paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.surfaceMuted },
  week: { flexDirection: 'row', paddingHorizontal: theme.spacing.sm },
  day: { flex: 1, minWidth: 0, alignItems: 'center', gap: theme.spacing.sm },
  dayLabel: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 22, color: theme.colors.text },
  todayLabel: { ...theme.typography.label, color: theme.colors.primaryDark },
  track: { width: '100%', height: 56, paddingHorizontal: theme.spacing.xs,
    justifyContent: 'center', alignItems: 'center' },
  activeTrack: { backgroundColor: theme.colors.accentHighlight },
  runStart: { borderTopLeftRadius: theme.radius.full, borderBottomLeftRadius: theme.radius.full },
  runEnd: { borderTopRightRadius: theme.radius.full, borderBottomRightRadius: theme.radius.full },
  circle: { width: '100%', maxWidth: 48, aspectRatio: 1, borderRadius: theme.radius.full,
    borderWidth: 2, borderColor: theme.colors.cardDepth, backgroundColor: theme.colors.card,
    alignItems: 'center', justifyContent: 'center' },
  todayCircle: { borderColor: theme.colors.primary },
  completedCircle: { borderColor: theme.colors.accent },
  flash: { width: 23.2, height: 23.2 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },
  summaryFlash: { width: 19.3333, height: 19.3333 },
  summaryText: { ...theme.typography.body, flex: 1, fontSize: theme.text.body, lineHeight: 24, color: theme.colors.text },
});
