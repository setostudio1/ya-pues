import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { theme } from '@/constants/theme';

type Props = {
  style?: StyleProp<ViewStyle>;
  fallbackHref?: Href;
};

export default function BackButton({ style, fallbackHref = ROUTES.home }: Props) {
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8} onPress={goBack}
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
