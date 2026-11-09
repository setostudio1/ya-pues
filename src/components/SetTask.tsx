import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { loadTasks, saveTasks, Task } from '../storage/data';
import type { Intensity } from '../types/tasks';
import BackButton from './BackButton';
import Button from './Button';
import { ErrorState } from './DataState';
import FillForm from './FillForm';
import SetIntensity from './SetIntensity';
import StepLabel from './StepLabel';
import TaskInvitation from './TaskInvitation';

export default function SetTask({ value, intensity, onChange, onIntensityChange, onContinue, error }: {
  value: string; intensity: Intensity; onChange: (title: string) => void;
  onIntensityChange: (intensity: Intensity) => void; onContinue: () => void; error?: string;
}) {
  const handleSaveAndContinue = async () => {
    if (!value.trim()) {
      return;
    }

    // 1. Cargar tareas previas para no sobrescribirlas
    const existingTasks = await loadTasks();

    // 2. Crear el objeto con la nueva tarea
    const newTask: Task = {
      id: Date.now().toString(),
      title: value.trim(),
      intensity: intensity,
      createdAt: new Date().toISOString(),
    };

    // 3. Guardar en AsyncStorage agregando la nueva al inicio
    await saveTasks([newTask, ...existingTasks]);

    // 4. Continuar al siguiente paso
    onContinue();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View nativeID="ya-task-details" style={styles.container}>
          <BackButton />
          <StepLabel step="Paso 3 - La tarea" title="¿Qué tienes que hacer?"
            description="Descríbelo como una acción concreta" />
          <FillForm value={value} onChangeText={onChange} />
          <SetIntensity selected={intensity} onSelect={onIntensityChange} />
          <TaskInvitation taskTitle={value} />
          {!!error && <ErrorState message={error} />}
          <Button label="Continuar" onPress={handleSaveAndContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl, gap: theme.spacing.xxl },
});
  container: { flex: 1, padding: theme.spacing.xl, gap: theme.spacing.lg },
});
