import { StyleSheet, TextInput } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (title: string) => void;
};

export default function TaskTitleField({ value, onChange }: Props) {
  return (
    <TextInput
      accessibilityLabel="Nombre de la tarea"
      placeholder="Ej. Hacer tarea de taller con Seto"
      placeholderTextColor={theme.colors.textMuted}
      value={value}
      onChangeText={onChange}
      maxLength={120}
      multiline
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...theme.typography.body,
    minHeight: 140,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardDepth,
    backgroundColor: theme.colors.card,
    fontSize: theme.text.heading,
    lineHeight: 29,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
});
