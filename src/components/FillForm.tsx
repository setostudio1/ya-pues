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
  container: { backgroundColor: theme.colors.card, borderRadius: theme.radius.md,
    padding: theme.spacing.lg, minHeight: 176, borderWidth: 1, borderColor: theme.colors.cardDepth },
  input: { ...theme.typography.body, minHeight: 132, fontSize: theme.text.heading, lineHeight: 29,
    color: theme.colors.text, textAlignVertical: 'top' },
});
