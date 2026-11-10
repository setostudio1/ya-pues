import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FillForm from '@/components/task-form/FillForm';
import SetIntensity from '@/components/task-form/SetIntensity';
import StepLabel from '@/components/task-form/StepLabel';
import TaskInvitation from '@/components/task-form/TaskInvitation';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/DataState';
import { theme } from '@/constants/theme';
import type { Intensity } from '@/types/tasks';

type Props = {
  value: string;
  intensity: Intensity;
  onChange: (title: string) => void;
  onIntensityChange: (intensity: Intensity) => void;
  onContinue: () => void;
  error?: string;
};

export default function SetTask({ value, intensity, onChange, onIntensityChange, onContinue, error }: Props) {
  return (
    <SafeAreaView nativeID="ya-screen" style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.container}>
          <BackButton />
          <StepLabel step="Paso 3 - La tarea" title="¿Qué tienes que hacer?"
            description="Descríbelo como una acción concreta" />
          <FillForm value={value} onChangeText={onChange} />
          <SetIntensity selected={intensity} onSelect={onIntensityChange} />
          <TaskInvitation taskTitle={value} />
          {!!error && <ErrorState message={error} />}
          <Button label="Continuar" onPress={onContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: theme.layout.maxWidth,
    alignSelf: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
});
