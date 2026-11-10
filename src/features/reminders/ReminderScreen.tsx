import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import { theme } from '../../constants/theme';
import ReminderArtwork from './ReminderArtwork';
import { formatReminderCopy } from './reminderCopy';
import type { ReminderScreenProps } from './reminderTypes';

export default function ReminderScreen({ reminder, preview = false, onDismiss, onGoHome, onSnooze, onContinue,
  actionBusy = false, actionError }: ReminderScreenProps) {
  const { width, height, fontScale } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const canvasWidth = Math.min(width, 560);
  const compact = height < 700 || fontScale > 1.3;
  const initial = reminder.variant === 'initial';
  const initialArtSize = Math.min(canvasWidth * 0.86, compact ? 260 : 343);
  const copy = formatReminderCopy(reminder);

  return (
    <SafeAreaView nativeID="ya-reminder-screen" edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar recordatorio" onPress={onDismiss}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="close" size={24} color={theme.colors.primary} accessible={false} />
        </Pressable>
        {preview && <Text style={styles.preview}>Vista previa</Text>}
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={onGoHome}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="home-outline" size={22} color={theme.colors.primary} accessible={false} />
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.canvas, { width: canvasWidth }, compact && styles.compactCanvas]}>
          {initial && <View style={[styles.initialArtwork, { height: initialArtSize }]}>
            <ReminderArtwork variant={reminder.variant} width={canvasWidth} maxHeight={initialArtSize} />
          </View>}
          <View style={[styles.copy, !initial && styles.topCopy]}>
            <Text accessibilityRole="header" style={[styles.title, reminder.variant === 'personal' && styles.personalTitle]}>{copy.heading}</Text>
            <Text style={styles.message}>{copy.lead}<Text style={styles.emphasis}>{copy.emphasis}</Text>{copy.tail}</Text>
          </View>
          {initial ? (
            <View nativeID="ya-reminder-actions" style={[styles.actions, { paddingBottom: Math.max(bottom, theme.spacing.xl) }]}>
              <Button label={actionBusy ? 'Posponiendo…' : 'Posponer'} disabled={!onSnooze || actionBusy} onPress={() => onSnooze?.(reminder.id)} />
              {!!actionError && <Text accessibilityRole="alert" style={styles.previewNote}>{actionError}</Text>}
              {onContinue && <Pressable accessibilityRole="button" onPress={onContinue}
                style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
                <Text style={styles.continueLabel}>Continuar</Text>
              </Pressable>}
              {preview && <Text style={styles.previewNote}>La demo no programa avisos.</Text>}
            </View>
          ) : (
            <View style={[styles.croppedArtwork, { minHeight: compact ? 300 : 360 }]}>
              <ReminderArtwork variant={reminder.variant} width={canvasWidth} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.card },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.xs, maxWidth: 640, width: '100%', alignSelf: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  preview: { ...theme.typography.caption, flexShrink: 1, textAlign: 'center', fontSize: theme.text.caption, color: theme.colors.textMutedStrong },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  canvas: { flexGrow: 1, alignSelf: 'center', paddingTop: 40 },
  compactCanvas: { paddingTop: theme.spacing.md },
  initialArtwork: { width: '100%', marginBottom: theme.spacing.xl, overflow: 'hidden' },
  copy: { alignItems: 'center', paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm },
  topCopy: { paddingTop: theme.spacing.xl },
  title: { ...theme.typography.display, fontSize: 48, lineHeight: 56, color: theme.colors.primary, textAlign: 'center' },
  personalTitle: { fontSize: 44, lineHeight: 50 },
  message: { ...theme.typography.label, maxWidth: 310, fontSize: theme.text.body, lineHeight: 22,
    color: theme.colors.primary, textAlign: 'center' },
  emphasis: { fontWeight: '700', fontStyle: 'italic' },
  actions: { width: '100%', maxWidth: 291, paddingHorizontal: theme.spacing.xl, alignSelf: 'center',
    marginTop: 48, paddingBottom: theme.spacing.xl, gap: theme.spacing.xs },
  continueButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  continueLabel: { ...theme.typography.label, fontSize: theme.text.small, color: theme.colors.primary, textDecorationLine: 'underline' },
  previewNote: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.textMutedStrong, textAlign: 'center' },
  croppedArtwork: { flexGrow: 1, width: '100%', marginTop: theme.spacing.lg, overflow: 'hidden' },
  pressed: { opacity: 0.65 },
});
