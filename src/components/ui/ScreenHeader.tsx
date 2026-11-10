import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
};

export default function ScreenHeader({ title, subtitle, description }: Props) {
  return (
    <View style={styles.heading}>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  subtitle: { ...theme.typography.caption, color: theme.colors.primary, fontSize: theme.text.small },
  title: { ...theme.typography.title, color: theme.colors.text, fontSize: theme.text.title, lineHeight: 36 },
  description: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.body },
});
