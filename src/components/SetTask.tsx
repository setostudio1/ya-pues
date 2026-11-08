import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Intensity } from '../types/tasks';
import InputField from './InputField';
import IntensityChip from './IntensityChip';
import TaskStepScreen from './TaskStepScreen';

export default function SetTask({ value, intensity, onChange, onIntensityChange, onContinue, error }: {
  value: string; intensity: Intensity; onChange: (title: string) => void;
  onIntensityChange: (intensity: Intensity) => void; onContinue: () => void; error?: string;
}) {
  return (
    <TaskStepScreen step="Paso 3 - La tarea" title="¿Qué tienes que hacer?" description="Descríbelo como una acción concreta"
      buttonLabel="Continuar" onContinue={onContinue} error={error}>
      <InputField label="Nombre de la tarea" value={value} onChangeText={onChange} multiline maxLength={120}
        placeholder="Ej. Hacer tarea de taller con Seto" style={styles.input} />
      <View style={styles.intensity}>
        <Text style={styles.label}>Intensidad</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Intensidad" style={styles.chips}>
          {(['low', 'medium', 'high'] as const).map((level) => <IntensityChip key={level} intensity={level}
            selected={intensity === level} onPress={() => onIntensityChange(level)} />)}
        </View>
      </View>
    </TaskStepScreen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 204, padding: theme.spacing.lg },
  intensity: { marginTop: 40, gap: theme.spacing.md },
  label: { fontSize: theme.text.caption, fontWeight: '600', color: theme.colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
