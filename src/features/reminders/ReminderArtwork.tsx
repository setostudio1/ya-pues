import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { ReminderVariant } from './reminderTypes';
import { reminderVariants, triptychLayout } from './reminderVariants';

const CROSSED_ARMS = require('./assets/initial.png');
const ANGRY = require('./assets/personal.png');
const TRIPTYCH = require('./assets/urgent-triptych.png');

function TriptychFigure({ region, width, height }: {
  region: keyof typeof triptychLayout.regions; width: number; height: number;
}) {
  const crop = triptychLayout.regions[region];
  const scale = Math.min(width / crop.width, height / triptychLayout.height);
  const cropWidth = crop.width * scale;
  const cropHeight = triptychLayout.height * scale;
  return (
    <View style={{ position: 'absolute', width: cropWidth, height: cropHeight, overflow: 'hidden',
      left: (width - cropWidth) / 2, top: (height - cropHeight) / 2 }}>
      <Image source={TRIPTYCH} contentFit="contain" accessible={false}
        style={{ position: 'absolute', width: triptychLayout.width * scale,
          height: cropHeight, left: -crop.x * scale, top: 0 }} />
    </View>
  );
}

export default function ReminderArtwork({ variant, width, thumbnail = false, maxHeight }: {
  variant: ReminderVariant; width: number; thumbnail?: boolean; maxHeight?: number;
}) {
  const config = reminderVariants[variant];
  if (variant === 'urgent') {
    const scale = width / 402;
    return (
      <View pointerEvents="none" accessible={false} style={styles.canvas}>
        {thumbnail ? <TriptychFigure region="alarm" width={width} height={width * 1.2} />
          : triptychLayout.layers.map((layer) => (
            <View key={layer.region} style={{ position: 'absolute', left: layer.x * scale, top: layer.y * scale,
              width: layer.width * scale, height: layer.height * scale }}>
              <TriptychFigure region={layer.region} width={layer.width * scale} height={layer.height * scale} />
            </View>
          ))}
      </View>
    );
  }
  const imageWidth = thumbnail ? width : variant === 'initial'
    ? Math.min(width * config.imageWidthRatio, maxHeight ?? 343) : width * config.imageWidthRatio;
  const imageHeight = imageWidth / config.imageAspectRatio;
  return (
    <View pointerEvents="none" accessible={false} style={styles.canvas}>
      <Image source={variant === 'personal' ? ANGRY : CROSSED_ARMS} contentFit="contain"
        accessible={false} style={{ position: 'absolute', width: imageWidth, height: imageHeight,
          left: (width - imageWidth) / 2, top: thumbnail ? 0 : width * config.imageTopRatio }} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, width: '100%', overflow: 'hidden' },
});
