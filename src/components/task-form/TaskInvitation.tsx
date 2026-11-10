import Ionicons from '@expo/vector-icons/Ionicons';
import { openURL } from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CompanionAvatar } from '@/components/home/CompanionAvatars';
import { theme } from '@/constants/theme';
import { useTaskDraft } from '@/context/TaskDraftContext';
import { buildTaskInvitationUrl, normalizeCompanionEmail } from '@/utils/invitations';

export default function TaskInvitation({ taskTitle }: { taskTitle: string }) {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const { draft, updateDraft } = useTaskDraft();
  const companions = draft.companions ?? [];
  const [focused, setFocused] = useState(false);
  const candidate = normalizeCompanionEmail(email);
  const alreadyAdded = !!candidate && companions.some((entry) => entry.email.toLowerCase() === candidate.toLowerCase());

  function addCompanion() {
    if (!candidate) {
      setError('Escribe un correo electrónico válido para añadir un compañero.');
      return;
    }
    if (alreadyAdded) {
      setError('Ese compañero ya está añadido.');
      return;
    }
    updateDraft({ companions: [...companions, { email: candidate }] });
    setEmail('');
    setError('');
  }

  async function inviteByEmail() {
    setError('');
    if (email.trim()) {
      setError('Añade el correo que estás escribiendo con el botón + antes de invitar.');
      return;
    }
    if (companions.length === 0) return;
    try {
      await openURL(buildTaskInvitationUrl(taskTitle, companions.map((companion) => companion.email)));
    } catch {
      setError('No pudimos abrir tu app de correo. Inténtalo de nuevo o revisa que tengas una configurada.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>¿Harás la tarea con alguien?</Text>
      <View style={[styles.inputRow, focused && styles.focusedInput]}>
        <Ionicons name="people-outline" size={21} color={theme.colors.textMutedStrong} accessible={false} />
        <TextInput accessibilityLabel="Añadir compañeros por correo" placeholder="Añadir compañeros"
          placeholderTextColor={theme.colors.textMutedStrong} value={email} maxLength={254}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
          returnKeyType="done" submitBehavior="submit" underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChangeText={(next) => { setEmail(next); setError(''); }}
          onSubmitEditing={addCompanion} style={styles.input} />
        <Pressable accessibilityRole="button" accessibilityLabel="Añadir compañero"
          disabled={!email.trim()} accessibilityState={{ disabled: !email.trim() }} onPress={addCompanion}
          style={({ pressed }) => [styles.iconButton, !email.trim() && styles.disabled, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={theme.colors.primary} accessible={false} />
        </Pressable>
      </View>
      {candidate && !alreadyAdded && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Añadir a ${candidate}`}
          onPress={addCompanion} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
          <CompanionAvatar companion={{ email: candidate }} size={34} />
          <View style={styles.personCopy}>
            <Text style={styles.email}>{candidate}</Text>
            <Text style={styles.caption}>Añadir a compañeros</Text>
          </View>
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} accessible={false} />
        </Pressable>
      )}
      <View style={styles.people}>
        <View style={styles.person}>
          <View style={[styles.avatar, styles.organizerAvatar]}>
            <Ionicons name="person-outline" size={20} color={theme.colors.text} accessible={false} />
          </View>
          <View style={styles.personCopy}>
            <Text style={styles.email}>Tú</Text>
            <Text style={styles.caption}>Organizador</Text>
          </View>
        </View>
        {companions.map((companion) => (
          <View key={companion.email.toLowerCase()} style={styles.person}>
            <CompanionAvatar companion={companion} size={34} />
            <Text style={[styles.email, styles.personEmail]} selectable>{companion.email}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Quitar a ${companion.email}`}
              onPress={() => { updateDraft({ companions: companions.filter((entry) => entry.email !== companion.email) }); setError(''); }}
              style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={theme.colors.textMutedStrong} accessible={false} />
            </Pressable>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel="Invitar por correo"
        accessibilityHint="Abre tu app de correo con los compañeros añadidos como destinatarios para que envíes la invitación."
        disabled={companions.length === 0} accessibilityState={{ disabled: companions.length === 0 }}
        onPress={() => { void inviteByEmail(); }}
        style={({ pressed }) => [styles.action, companions.length === 0 && styles.disabled, pressed && styles.pressed]}>
        <Ionicons name="mail-outline" size={20} color={theme.colors.primary} accessible={false} />
        <Text style={styles.actionLabel}>Invitar por correo{companions.length > 0 ? ` (${companions.length})` : ''}</Text>
      </Pressable>
      <Text style={styles.caption}>Los compañeros se añadirán como destinatarios de la invitación.</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, padding: theme.spacing.lg, gap: theme.spacing.md },
  question: { ...theme.typography.label, fontSize: theme.text.body, lineHeight: 24, color: theme.colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border, borderBottomWidth: 2,
    borderRadius: theme.radius.sm, paddingLeft: theme.spacing.md, backgroundColor: theme.colors.surfaceMuted },
  focusedInput: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  input: { ...theme.typography.body, flex: 1, minWidth: 0, minHeight: 52, paddingVertical: theme.spacing.md,
    fontSize: theme.text.small, color: theme.colors.text },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md,
    backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm },
  avatar: { width: 34, height: 34, borderRadius: theme.radius.full, backgroundColor: theme.colors.primarySoft,
    borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  organizerAvatar: { backgroundColor: theme.colors.accentSoft },
  people: { gap: theme.spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 44 },
  personCopy: { flex: 1, minWidth: 0 },
  email: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 22, color: theme.colors.text },
  personEmail: { flex: 1, minWidth: 0 },
  caption: { ...theme.typography.body, fontSize: theme.text.caption, lineHeight: 18, color: theme.colors.textMutedStrong },
  removeButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  disabled: { opacity: 0.4 },
  action: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    minHeight: 44, paddingVertical: theme.spacing.sm, paddingRight: theme.spacing.md, borderRadius: theme.radius.sm },
  actionLabel: { ...theme.typography.label, fontSize: theme.text.small, lineHeight: 22,
    color: theme.colors.primary, textDecorationLine: 'underline' },
  pressed: { opacity: 0.65 },
  error: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 22, color: theme.colors.dangerInk },
});
