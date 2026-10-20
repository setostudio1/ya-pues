import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  step: string;
  title: string;
  description: string;
};

export default function StepLabel({ step, title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  step: {
    fontSize: theme.text.small,
    color: theme.colors.primary,
  },
  title: {
    fontSize: theme.text.title,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.text.body,
    color: theme.colors.textMuted,
  },
});