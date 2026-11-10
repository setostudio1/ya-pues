import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { TaskCompanion } from '@/types/tasks';
import { companionInitials } from '@/utils/companions';

export function CompanionAvatar({ companion, size = 32 }: { companion: TaskCompanion; size?: number }) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const avatarUri = companion.avatarUri?.trim();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Compañero: ${companion.email}`}
      style={[styles.avatar, { width: size, height: size }]}>
      <Text accessible={false} style={[styles.initials, { fontSize: size * 0.36 }]}>{companionInitials(companion.email)}</Text>
      {!!avatarUri && failedUri !== avatarUri && <Image source={{ uri: avatarUri }} contentFit="cover"
        recyclingKey={companion.email} accessible={false} style={StyleSheet.absoluteFill}
        onError={() => setFailedUri(avatarUri)} />}
    </View>
  );
}

export default function CompanionAvatars({ companions }: { companions: readonly TaskCompanion[] }) {
  if (companions.length === 0) return null;
  const visible = companions.slice(0, 2);
  const remaining = companions.slice(2);

  return (
    <View style={styles.stack}>
      {visible.map((companion, index) => (
        <View key={companion.email.toLowerCase()} style={index > 0 && styles.overlap}>
          <CompanionAvatar companion={companion} size={28} />
        </View>
      ))}
      {remaining.length > 0 && <View accessible accessibilityLabel={`${remaining.length} compañeros más: ${remaining.map((companion) => companion.email).join(', ')}`}
        style={[styles.avatar, styles.overflow, styles.overlap]}>
        <Text style={styles.overflowText}>+{remaining.length}</Text>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: theme.radius.full, borderWidth: 2, borderColor: theme.colors.card,
    backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { ...theme.typography.label, color: theme.colors.primaryDark },
  stack: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  overlap: { marginLeft: -8 },
  overflow: { width: 28, height: 28 },
  overflowText: { ...theme.typography.label, color: theme.colors.primaryDark, fontSize: 10 },
});
