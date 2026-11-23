import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ImageStyle } from 'react-native';

import type { ReminderVariant } from '@/types/reminders';

const CROSSED_ARMS = require('@/assets/images/reminders/crossed-arms.png');
const ALARM = require('@/assets/images/reminders/alarm.png');
const ANGRY = require('@/assets/images/reminders/angry.png');

// Same artwork downscaled to 3x of the 72x90 preview card (aspect ratio preserved).
const CROSSED_ARMS_THUMB = require('@/assets/images/reminders/thumbs/crossed-arms.png');
const ALARM_THUMB = require('@/assets/images/reminders/thumbs/alarm.png');
const ANGRY_THUMB = require('@/assets/images/reminders/thumbs/angry.png');

const IMAGES: Record<ReminderVariant, number> = {
  initial: CROSSED_ARMS,
  unstarted: CROSSED_ARMS,
  urgent: ALARM,
  personal: ANGRY,
};

const THUMBNAILS: Record<ReminderVariant, number> = {
  initial: CROSSED_ARMS_THUMB,
  unstarted: CROSSED_ARMS_THUMB,
  urgent: ALARM_THUMB,
  personal: ANGRY_THUMB,
};

type Props = {
  variant: ReminderVariant;
  closeUp?: boolean;
  thumbnail?: boolean;
  style?: StyleProp<ImageStyle>;
};

export default function ReminderArtwork({ variant, closeUp = false, thumbnail = false, style }: Props) {
  return (
    <Image
      source={thumbnail ? THUMBNAILS[variant] : IMAGES[variant]}
      contentFit={closeUp ? 'cover' : 'contain'}
      contentPosition="top"
      accessible={false}
      accessibilityLabel=""
      style={[styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
