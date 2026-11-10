import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = { step: string; title: string; description?: string };

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
  container: { alignItems: 'center', gap: theme.spacing.md },
  step: { ...theme.typography.caption, fontSize: theme.text.small, color: theme.colors.primary, textAlign: 'center' },
  title: { ...theme.typography.title, fontSize: 26, lineHeight: 34, color: theme.colors.text, textAlign: 'center', maxWidth: 480 },
  description: { ...theme.typography.body, fontSize: theme.text.body, color: theme.colors.textMutedStrong, textAlign: 'center' },
});
