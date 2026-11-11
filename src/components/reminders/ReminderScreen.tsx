import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReminderArtwork from '@/components/reminders/ReminderArtwork';
import Button from '@/components/ui/Button';
import { REMINDERS } from '@/constants/reminders';
import { theme } from '@/constants/theme';
import type { ReminderVariant } from '@/types/reminders';

type Props = {
  variant: ReminderVariant;
  taskTitle: string;
  name: string;
  preview: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onHome: () => void;
  onSnooze: () => void;
  onContinue: () => void;
};

export default function ReminderScreen({
  variant, taskTitle, name, preview, busy, error, onClose, onHome, onSnooze, onContinue,
}: Props) {
  const text = REMINDERS[variant];
  const isInitial = variant === 'initial';
  const heading = variant === 'personal' && name ? `${name.toUpperCase()}!!!` : text.heading;

  return (
    <SafeAreaView nativeID="ya-reminder-screen" edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar aviso" onPress={onClose} style={styles.iconButton}>
          <Ionicons name="close" size={24} color={theme.colors.primary} />
        </Pressable>
        {preview && <Text style={styles.preview}>Vista previa</Text>}
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={onHome} style={styles.iconButton}>
          <Ionicons name="home-outline" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isInitial && <ReminderArtwork variant={variant} style={styles.topArtwork} />}

        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.heading}>{heading}</Text>
          <Text style={styles.message}>
            {text.lead}<Text style={styles.taskTitle}>{taskTitle.toUpperCase()}</Text>{text.tail}
          </Text>
        </View>

        {isInitial ? (
          <View nativeID="ya-reminder-actions" style={styles.actions}>
            <Button label={busy ? 'Posponiendo…' : 'Posponer'} disabled={busy} onPress={onSnooze} />
            <Pressable accessibilityRole="button" onPress={onContinue} style={styles.continueButton}>
              <Text style={styles.continueLabel}>Continuar</Text>
            </Pressable>
            {!!error && <Text accessibilityRole="alert" style={styles.note}>{error}</Text>}
          </View>
        ) : (
          <ReminderArtwork variant={variant} closeUp={variant === 'unstarted'} style={styles.bottomArtwork} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.card },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%',
    maxWidth: theme.layout.maxWidth, alignSelf: 'center', paddingHorizontal: theme.spacing.md },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  preview: { ...theme.typography.caption, fontSize: theme.text.caption, color: theme.colors.textMutedStrong },
  content: { flexGrow: 1, width: '100%', maxWidth: theme.layout.formMaxWidth, alignSelf: 'center',
    paddingTop: theme.spacing.xl, gap: theme.spacing.xl },
  topArtwork: { width: '86%', height: undefined, aspectRatio: 1, alignSelf: 'center' },
  bottomArtwork: { flexGrow: 1, minHeight: 360 },
  copy: { alignItems: 'center', paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm },
  heading: { ...theme.typography.display, fontSize: theme.text.reminderHeading, lineHeight: 56, color: theme.colors.primary, textAlign: 'center' },
  message: { ...theme.typography.label, maxWidth: 310, fontSize: theme.text.body, lineHeight: 22,
    color: theme.colors.primary, textAlign: 'center' },
  taskTitle: { fontWeight: '700', fontStyle: 'italic' },
  actions: { width: '100%', maxWidth: 291, alignSelf: 'center', paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl, gap: theme.spacing.xs },
  continueButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  continueLabel: { ...theme.typography.label, fontSize: theme.text.small, color: theme.colors.primary,
    textDecorationLine: 'underline' },
  note: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.dangerInk, textAlign: 'center' },
});
