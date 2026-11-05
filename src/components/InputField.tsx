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
  label: { color: theme.colors.text, fontSize: theme.text.body, fontWeight: '600' },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, backgroundColor: theme.colors.card,
    padding: theme.spacing.md, fontSize: theme.text.body, color: theme.colors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
});
