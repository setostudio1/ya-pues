import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type Props = {
  step: string;
  title: string;
};

export default function StepLabel({ step, title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  step: {
    fontSize: theme.text.caption,
    color: theme.colors.textMuted,
  },

  title: {
    fontSize: theme.text.heading,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
  },
});