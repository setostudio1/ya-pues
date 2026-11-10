import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import RouteScreen from '../../components/RouteScreen';
import { theme } from '../../constants/theme';
import ReminderArtwork from './ReminderArtwork';
import NotificationControls from './NotificationControls';
import { REMINDER_VARIANTS, reminderVariants } from './reminderVariants';

export default function ReminderPreviewScreen() {
  return (
    <RouteScreen title="Recordatorios" subtitle="Tus avisos"
      description="Configura los avisos de tus tareas y tu recordatorio diario.">
      <NotificationControls />
      <Text accessibilityRole="header" style={styles.title}>Vistas previas</Text>
      <Text style={styles.description}>Estos diseños usan datos ficticios y no programan avisos.</Text>
      {REMINDER_VARIANTS.map((variant) => {
        const config = reminderVariants[variant];
        return (
          <Link key={variant} href={{ pathname: config.route, params: { preview: '1' } }} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${config.label}`}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={styles.thumbnail}><ReminderArtwork variant={variant} width={72} thumbnail /></View>
              <View style={styles.copy}>
                <Text style={styles.title}>{config.label}</Text>
                <Text style={styles.description}>{config.description}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} accessible={false} />
            </Pressable>
          </Link>
        );
      })}
    </RouteScreen>
  );
}

const styles = StyleSheet.create({
  card: { ...theme.surfaces.card, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  thumbnail: { width: 72, height: 90, overflow: 'hidden' },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  title: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  description: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 21, color: theme.colors.textMutedStrong },
  pressed: { opacity: 0.7 },
});
