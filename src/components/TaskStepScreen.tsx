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
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.container}>
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
  container: { width: '100%', maxWidth: 402, paddingHorizontal: 34, paddingTop: 80, paddingBottom: 40 },
  backButton: { position: 'absolute', top: 16, left: 34 },
  body: { marginTop: 70 },
  instructions: { alignItems: 'center', marginTop: 80, gap: 4 },
  instruction: { fontSize: theme.text.body, fontWeight: 'bold', color: theme.colors.text },
  caption: { fontSize: theme.text.caption, color: theme.colors.textMuted, textAlign: 'center' },
  buttonContainer: { width: 243, maxWidth: '100%', alignSelf: 'center', marginTop: 80 },
});
