import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import StepLabel from '@/components/task-form/StepLabel';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import Screen from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

type Props = {
  step: string;
  title: string;
  description?: string;
  caption?: string;
  buttonLabel?: string;
  busy?: boolean;
  error?: string;
  onContinue: () => void;
  children: ReactNode;
};

export default function TaskStepScreen({
  step, title, description, caption, buttonLabel = 'Establecer', busy = false, error, onContinue, children,
}: Props) {
  return (
    <Screen>
      <BackButton />
      <StepLabel step={step} title={title} description={description} />
      <View style={styles.body}>{children}</View>
      {caption && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Desliza</Text>
          <Text style={styles.hintText}>{caption}</Text>
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
