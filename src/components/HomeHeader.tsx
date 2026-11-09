import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <View nativeID="ya-home-greeting" style={styles.greetingRow}>
        <View style={styles.greetingCopy}>
          <Text accessibilityRole="header" style={styles.greeting}>Buen día,</Text>
          <Text style={styles.question}>¿Qué tienes que hacer hoy?</Text>
        </View>
        <Image source={require('../../assets/images/home/mascot.png')}
          contentFit="contain" accessible={false} style={styles.mascot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.xxl },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.lg },
  greetingCopy: { flex: 1, gap: theme.spacing.xs },
  greeting: { ...theme.typography.title, color: theme.colors.text, fontSize: 24, lineHeight: 30 },
  question: { ...theme.typography.body, fontSize: theme.text.small, lineHeight: 20, color: theme.colors.textMutedStrong, maxWidth: 200 },
  mascot: { width: 88, height: 81 },
});
