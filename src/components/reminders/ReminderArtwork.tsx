import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ImageStyle } from 'react-native';

import type { ReminderVariant } from '@/types/reminders';

const CROSSED_ARMS = require('@/assets/images/reminders/crossed-arms.png');
const ALARM = require('@/assets/images/reminders/alarm.png');
const ANGRY = require('@/assets/images/reminders/angry.png');

const IMAGES: Record<ReminderVariant, number> = {
  initial: CROSSED_ARMS,
  unstarted: CROSSED_ARMS,
  urgent: ALARM,
  personal: ANGRY,
};

type Props = {
  variant: ReminderVariant;
  closeUp?: boolean;
  style?: StyleProp<ImageStyle>;
};

export default function ReminderArtwork({ variant, closeUp = false, style }: Props) {
  return (
    <Image
      source={IMAGES[variant]}
      contentFit={closeUp ? 'cover' : 'contain'}
      contentPosition="top"
      accessible={false}
      style={[styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
