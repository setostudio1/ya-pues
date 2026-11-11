import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import InputField from '@/components/ui/InputField';
import { theme } from '@/constants/theme';
import type { RegistrationInput } from '@/types/auth';
import { MIN_PASSWORD_LENGTH } from '@/utils/auth';

type Props = {
  submitting: boolean;
  error: string;
  onSubmit: (input: RegistrationInput) => void;
  onChange: () => void;
};

const EMPTY_FORM: RegistrationInput = { name: '', email: '', password: '', confirmPassword: '' };

export default function RegisterForm({ submitting, error, onSubmit, onChange }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isComplete = Object.values(form).every((value) => value.trim() !== '');

  function update(field: keyof RegistrationInput, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    onChange();
  }

  return (
    <View style={styles.form}>
      <InputField label="Nombre" placeholder="¿Cómo te llamas?" autoComplete="name" textContentType="name"
        maxLength={60} editable={!submitting} value={form.name} onChangeText={(value) => update('name', value)} />
      <InputField label="Email" placeholder="tu.email@ejemplo.com" keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
        editable={!submitting} value={form.email} onChangeText={(value) => update('email', value)} />
      <InputField label="Contraseña" placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`} secureTextEntry
        autoComplete="new-password" textContentType="newPassword" editable={!submitting} value={form.password}
        onChangeText={(value) => update('password', value)} />
      <InputField label="Confirmar contraseña" placeholder="Repite tu contraseña" secureTextEntry
        autoComplete="new-password" textContentType="newPassword" editable={!submitting}
        value={form.confirmPassword} onChangeText={(value) => update('confirmPassword', value)}
        onSubmitEditing={() => { if (isComplete) onSubmit(form); }} />
      {!!error && <ErrorState message={error} />}
      <Button label={submitting ? 'Creando cuenta…' : 'Crear cuenta'} disabled={submitting || !isComplete}
        accessibilityState={{ busy: submitting }} onPress={() => onSubmit(form)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
});
