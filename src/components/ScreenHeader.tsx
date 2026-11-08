import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

export default function ScreenHeader({ title, subtitle, description }: {
  title: string; subtitle?: string; description?: string;
}) {
  return (
    <View style={styles.heading}>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: theme.spacing.md },
  subtitle: { color: theme.colors.primary, fontSize: theme.text.small, fontWeight: '600' },
  title: { color: theme.colors.text, fontSize: theme.text.title, fontWeight: 'bold' },
  description: { color: theme.colors.textMuted, fontSize: theme.text.body, lineHeight: 24 },
});
