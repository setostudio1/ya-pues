import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ReminderArtwork from '@/components/reminders/ReminderArtwork';
import { REMINDER_VARIANTS, REMINDERS } from '@/constants/reminders';
import { theme } from '@/constants/theme';

export default function ReminderPreviewList() {
  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.title}>Vistas previas</Text>
      <Text style={styles.description}>Estos diseños usan una tarea de ejemplo y no programan avisos.</Text>
      {REMINDER_VARIANTS.map((variant) => {
        const { route, label, description } = REMINDERS[variant];
        return (
          <Pressable key={variant} accessibilityRole="button" accessibilityLabel={`Ver ${label}`}
            onPress={() => router.push({ pathname: route, params: { preview: '1' } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.thumbnail}>
              <ReminderArtwork variant={variant} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.spacing.md },
  card: { ...theme.surfaces.card, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  thumbnail: { width: 72, height: 90 },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  title: { ...theme.typography.heading, fontSize: theme.text.body, color: theme.colors.text },
  description: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 21, color: theme.colors.textMutedStrong },
  pressed: { opacity: 0.7 },
});
