import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import { theme } from '@/constants/theme';

export function LoadingState() {
  return <View style={styles.container}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.text}>Cargando tus datos…</Text></View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.container, styles.errorContainer]}>
      <Text accessibilityRole="alert" style={[styles.text, styles.errorText]}>{message}</Text>
      {onRetry && <Button label="Reintentar" onPress={onRetry} variant="secondary" />}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <View style={styles.container}><Text style={styles.text}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md, padding: theme.spacing.xl, borderWidth: 1,
    borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.card },
  errorContainer: { backgroundColor: theme.colors.coralSoft, borderColor: theme.colors.coral },
  errorText: { color: theme.colors.dangerInk },
  text: { ...theme.typography.body, color: theme.colors.textMutedStrong, fontSize: theme.text.body },
});
