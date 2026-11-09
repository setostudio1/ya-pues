import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '../constants/theme';

export default function BackButton({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Volver"
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}>
      <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
      <Text style={styles.label}>Volver</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', minHeight: 44, minWidth: 44,
    gap: theme.spacing.xs, paddingRight: theme.spacing.md, borderRadius: theme.radius.full },
  label: { ...theme.typography.label, color: theme.colors.primary, fontSize: theme.text.small },
  pressed: { opacity: 0.7 },
});
