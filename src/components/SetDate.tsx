import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import Button from './Button';
import DateOption from './DateOption';
import StepLabel from './StepLabel';

export default function SetDate() {
  return (
    <View style={styles.container}>
      <StepLabel
        step="Paso 1 - Fecha Límite"
        title="¿Cuándo tiene que estar hecha esta tarea?"
      />

      <View style={styles.datePicker}>
        <View style={styles.column}>
          <DateOption label="20" />
          <DateOption label="21" selected />
          <DateOption label="22" />
        </View>

        <View style={styles.column}>
          <DateOption label="MAY" />
          <DateOption label="JUN" selected />
          <DateOption label="JUL" />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instruction}>Desliza</Text>
        <Text style={styles.caption}>Para cambiar la fecha</Text>
      </View>

      <Button
        label="Establecer"
        onPress={() => {
          console.log('Fecha establecida');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },

  datePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },

  column: {
    gap: theme.spacing.sm,
    alignItems: 'center',
  },

  instructions: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  instruction: {
    fontSize: theme.text.body,
    fontWeight: 'bold',
    color: theme.colors.text,
  },

  caption: {
    fontSize: theme.text.caption,
    color: theme.colors.textMuted,
  },
});