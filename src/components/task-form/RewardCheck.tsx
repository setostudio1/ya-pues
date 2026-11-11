import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { theme } from '@/constants/theme';

export default function RewardCheck() {
  const scale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  useEffect(() => {
    scale.set(withSpring(1));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [scale]);

  return (
    <Animated.View style={[styles.check, checkStyle]}>
      <Ionicons name="checkmark-circle" size={110} color={theme.colors.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  check: { alignSelf: 'center' },
});
