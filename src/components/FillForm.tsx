import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function FillForm({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ej. Hacer tarea de taller con Seto"
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
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
    fontSize: theme.text.heading,
    color: theme.colors.text,
  },
});