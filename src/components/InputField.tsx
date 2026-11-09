import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '../constants/theme';

type Props = TextInputProps & { label: string };

export default function InputField({ label, style, multiline, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  label: { ...theme.typography.label, color: theme.colors.text, fontSize: theme.text.small, lineHeight: 21 },
  input: { ...theme.typography.body, minHeight: 56, borderWidth: theme.border.standard, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    fontSize: theme.text.body, color: theme.colors.text },
  multiline: { minHeight: 128, textAlignVertical: 'top' },
});
