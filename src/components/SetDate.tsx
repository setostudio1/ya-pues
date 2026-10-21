import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import Button from './Button';
import DatePickerColumn from './DatePickerColumn';
import StepLabel from './StepLabel';

const DAYS = Array.from(
  { length: 31 },
  (_, index) => String(index + 1)
);

const MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

export default function SetDate() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <StepLabel
          step="Paso 1 - Fecha Límite"
          title="¿Cuándo tiene que estar hecha esta tarea?"
        />

        <View style={styles.datePicker}>
          <DatePickerColumn
            items={DAYS}
            initialIndex={20}
            onChange={(day) => {
              console.log('Día:', day);
            }}
          />

          <DatePickerColumn
            items={MONTHS}
            initialIndex={5}
            onChange={(month) => {
              console.log('Mes:', month);
            }}
          />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instruction}>Desliza</Text>
          <Text style={styles.caption}>
            Para cambiar la fecha
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label="Establecer"
            onPress={() => {
              console.log('Fecha establecida');
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 402,
    paddingHorizontal: 34,
    paddingTop: 80,
    paddingBottom: 40,
  },

  datePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 70,
  },

  instructions: {
    alignItems: 'center',
    marginTop: 80,
    gap: 4,
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

  buttonContainer: {
    width: 243,
    alignSelf: 'center',
    marginTop: 80,
  },
});