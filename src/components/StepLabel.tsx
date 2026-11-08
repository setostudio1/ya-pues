import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type Props = { step: string; title: string; description?: string };

// Restored from feature/screen-set-date, with an optional description for step 3.
export default function StepLabel({ step, title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.step}>{step}</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: theme.spacing.sm },
  step: { fontSize: theme.text.caption, color: theme.colors.textMuted },
  title: { fontSize: theme.text.heading, fontWeight: 'bold', textAlign: 'center', color: theme.colors.text },
  description: { fontSize: theme.text.caption, textAlign: 'center', color: theme.colors.textMuted, lineHeight: 18 },
});
