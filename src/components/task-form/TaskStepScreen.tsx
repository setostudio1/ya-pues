import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { theme } from '@/constants/theme';

type Props = {
  step: string;
  title: string;
  description?: string;
  swipeHint?: string;
  buttonLabel?: string;
  busy?: boolean;
  error?: string;
  onContinue: () => void;
  children: ReactNode;
};

export default function TaskStepScreen({
  step, title, description, swipeHint, buttonLabel = 'Continuar', busy = false, error, onContinue, children,
}: Props) {
  return (
    <Screen>
      <BackButton />
      <ScreenHeader subtitle={step} title={title} description={description} centered />
      <View style={styles.body}>{children}</View>
      {swipeHint && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Desliza</Text>
          <Text style={styles.hintText}>{swipeHint}</Text>
        </View>
      )}
      {!!error && <ErrorState message={error} />}
      <Button label={buttonLabel} disabled={busy} accessibilityState={{ busy }} onPress={onContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: theme.spacing.lg },
  hint: { alignItems: 'center', gap: theme.spacing.xs },
  hintTitle: { ...theme.typography.label, fontSize: theme.text.body, color: theme.colors.text },
  hintText: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.textMutedStrong, textAlign: 'center' },
});
