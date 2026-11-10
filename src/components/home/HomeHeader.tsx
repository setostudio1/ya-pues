import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  name: string;
  onSignOut: () => void;
};

export default function HomeHeader({ name, onSignOut }: Props) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" hitSlop={8} onPress={onSignOut}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
        <Ionicons name="log-out-outline" size={18} color={theme.colors.textMutedStrong} />
        <Text style={styles.signOutLabel}>Cerrar sesión</Text>
      </Pressable>
      <View style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text accessibilityRole="header" style={styles.greeting}>Buen día, {name}</Text>
          <Text style={styles.question}>¿Qué tienes que hacer hoy?</Text>
        </View>
        <Image source={require('@/assets/images/home/mascot.png')}
          contentFit="contain" accessible={false} style={styles.mascot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  signOut: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
    minHeight: 36, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted },
  signOutLabel: { ...theme.typography.label, color: theme.colors.textMutedStrong, fontSize: theme.text.caption },
  pressed: { opacity: 0.7 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.lg },
  greetingCopy: { flex: 1, gap: theme.spacing.xs },
  greeting: { ...theme.typography.title, color: theme.colors.text, fontSize: theme.text.subtitle, lineHeight: 30 },
  question: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 20, color: theme.colors.textMutedStrong, maxWidth: 200 },
  mascot: { width: 88, height: 81 },
});
