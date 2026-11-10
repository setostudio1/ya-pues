import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { calculateProgress } from '@/utils/tasks';

const MASCOT = require('@/assets/images/streak/mascot.png');
const RING = require('@/assets/images/streak/ring.svg');

export default function StreakHero({ progress }: {
  progress: Pick<ReturnType<typeof calculateProgress>, 'streak'>;
}) {
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.illustration}>
        <Image source={RING}
          contentFit="contain" accessible={false} style={styles.ring} />
        <Image source={MASCOT} contentFit="contain" accessible={false} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.counter}>
        <Text accessibilityRole="header" accessibilityLabel={`${progress.streak} ${progress.streak === 1 ? 'día' : 'días'} de racha actual`}
          style={styles.total}>{progress.streak} {progress.streak === 1 ? 'DÍA' : 'DÍAS'}</Text>
        <Text style={styles.status}>{progress.streak > 0 ? 'RACHA ACTIVA' : 'RACHA ACTUAL'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', alignItems: 'center' },
  illustration: { width: '100%', maxWidth: 320, aspectRatio: 1, marginBottom: theme.spacing.md },
  ring: { position: 'absolute', width: '94%', height: '94%', left: '3%', top: '10%' },
  counter: { alignItems: 'center', marginTop: theme.spacing.xl, gap: theme.spacing.xs },
  total: { ...theme.typography.display, color: theme.colors.text, fontSize: 56, lineHeight: 66, textAlign: 'center' },
  status: { ...theme.typography.label, color: theme.colors.streakRingStrong,
    fontSize: theme.text.small, lineHeight: 20, textAlign: 'center' },
});
