import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
};

export default function ScreenHeader({ title, subtitle, description, centered = false }: Props) {
  const align = centered && styles.centered;

  return (
    <View style={[styles.heading, centered && styles.centeredHeading]}>
      {subtitle && <Text style={[styles.subtitle, align]}>{subtitle}</Text>}
      <Text accessibilityRole="header" style={[styles.title, align]}>{title}</Text>
      {description && <Text style={[styles.description, align]}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  centeredHeading: { alignItems: 'center' },
  centered: { textAlign: 'center' },
  subtitle: { ...theme.typography.caption, color: theme.colors.primary, fontSize: theme.text.small },
  title: { ...theme.typography.title, color: theme.colors.text, fontSize: theme.text.title, lineHeight: 36 },
  description: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.body },
});
