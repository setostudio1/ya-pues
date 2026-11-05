import { StyleSheet, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

// Recovered from the original SetTask screen (b7efdb8).
export default function FillForm({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Nombre de la tarea"
        style={styles.input}
        placeholder="Ej. Hacer tarea de taller con Seto"
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        maxLength={120}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    minHeight: 96,
    fontSize: theme.text.heading,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
});
