import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import Button from './Button';

export function LoadingState() {
  return <View style={styles.container}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.text}>Cargando tus datos…</Text></View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="alert" style={styles.text}>{message}</Text>
      {onRetry && <Button label="Reintentar" onPress={onRetry} variant="secondary" />}
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <View style={styles.container}><Text style={styles.text}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md, paddingVertical: theme.spacing.lg },
  text: { color: theme.colors.textMuted, fontSize: theme.text.body, lineHeight: 24 },
});
