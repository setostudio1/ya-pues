import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import BackButton from './BackButton';
import Button from './Button';
import { ErrorState } from './DataState';
import StepLabel from './StepLabel';

type Props = {
  step: string;
  title: string;
  description?: string;
  children: ReactNode;
  caption?: string;
  buttonLabel?: string;
  onContinue: () => void;
  error?: string;
};

// The original SetDate spacing is shared by every creation step.
export default function TaskStepScreen({
  step, title, description, children, caption, buttonLabel = 'Establecer', onContinue, error,
}: Props) {
  return (
    <SafeAreaView nativeID="ya-task-step-screen" edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View nativeID="ya-task-step" style={styles.container}>
          <BackButton style={styles.backButton} />
          <StepLabel step={step} title={title} description={description} />
          <View style={styles.body}>{children}</View>
          {caption && <View style={styles.instructions}>
            <Text style={styles.instruction}>Desliza</Text>
            <Text style={styles.caption}>{caption}</Text>
          </View>}
          <View style={styles.buttonContainer}>
            {!!error && <ErrorState message={error} />}
            <Button label={buttonLabel} onPress={onContinue} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  container: { flexGrow: 1, width: '100%', maxWidth: 680, paddingHorizontal: theme.spacing.xl,
    paddingTop: 96, paddingBottom: theme.spacing.xxxl },
  backButton: { position: 'absolute', top: 16, left: theme.spacing.xl },
  body: { marginTop: 48, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.sm },
  instructions: { alignItems: 'center', marginTop: theme.spacing.xl, gap: theme.spacing.xs },
  instruction: { ...theme.typography.label, fontSize: theme.text.body, color: theme.colors.text },
  caption: { ...theme.typography.body, fontSize: theme.text.caption, color: theme.colors.textMutedStrong, textAlign: 'center' },
  buttonContainer: { width: '100%', maxWidth: 320, alignSelf: 'center', marginTop: 48, gap: theme.spacing.md },
});
