import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import InputField from '@/components/ui/InputField';
import { theme } from '@/constants/theme';
import type { LoginInput } from '@/types/auth';

type Props = {
  submitting: boolean;
  error: string;
  onSubmit: (input: LoginInput) => void;
  onChange: () => void;
};

export default function LoginForm({ submitting, error, onSubmit, onChange }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit() {
    onSubmit({ email, password });
  }

  return (
    <View style={styles.form}>
      <InputField label="Email" placeholder="tu.email@ejemplo.com" keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
        returnKeyType="next" editable={!submitting} value={email}
        onChangeText={(value) => { setEmail(value); onChange(); }} />
      <InputField label="Contraseña" placeholder="Tu contraseña" secureTextEntry autoComplete="current-password"
        textContentType="password" returnKeyType="go" editable={!submitting} value={password}
        onChangeText={(value) => { setPassword(value); onChange(); }} onSubmitEditing={submit} />
      {!!error && <ErrorState message={error} />}
      <Button label={submitting ? 'Ingresando…' : 'Ingresar'} disabled={submitting}
        accessibilityState={{ busy: submitting }} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
});
