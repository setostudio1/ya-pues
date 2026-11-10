import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  items: string[];
  initialIndex?: number;
  value?: string;
  label?: string;
  onChange?: (value: string) => void;
};

const ITEM_HEIGHT = 64;

export default function DatePickerColumn({ items, initialIndex = 0, value, label = 'Valor', onChange }: Props) {
  const clamp = (index: number) => Math.max(0, Math.min(index, items.length - 1));
  const initial = clamp(value === undefined ? initialIndex : items.indexOf(value));
  const [localIndex, setLocalIndex] = useState(initial);
  const selectedIndex = value === undefined ? clamp(localIndex) : clamp(items.indexOf(value));
  const listRef = useRef<ScrollViewInstance>(null);
  const indexRef = useRef(initial);
  const offsetRef = useRef(initial * ITEM_HEIGHT);
  const [initialOffset] = useState(() => ({ x: 0, y: initial * ITEM_HEIGHT }));
  const readyRef = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(items.length);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const countChanged = countRef.current !== items.length;
    countRef.current = items.length;
    if (countChanged || indexRef.current !== selectedIndex) {
      if (snapTimer.current) clearTimeout(snapTimer.current);
      indexRef.current = selectedIndex;
      offsetRef.current = selectedIndex * ITEM_HEIGHT;
      listRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
    }
  }, [selectedIndex, items.length]);

  useEffect(() => () => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
  }, []);

  function reportIndex(index: number) {
    const next = clamp(index);
    if (next === indexRef.current || !items[next]) return;
    indexRef.current = next;
    setLocalIndex(next);
    onChangeRef.current?.(items[next]);
  }

  function selectIndex(index: number) {
    const next = clamp(index);
    reportIndex(next);
    listRef.current?.scrollTo({ y: next * ITEM_HEIGHT, animated: true });
  }

  function snapToClosest() {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    const next = clamp(Math.round(offsetRef.current / ITEM_HEIGHT));
    reportIndex(next);
    if (Math.abs(offsetRef.current - next * ITEM_HEIGHT) > 1) {
      listRef.current?.scrollTo({ y: next * ITEM_HEIGHT, animated: true });
    }
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (!readyRef.current) return;
    offsetRef.current = event.nativeEvent.contentOffset.y;
    reportIndex(Math.round(offsetRef.current / ITEM_HEIGHT));
    if (snapTimer.current) clearTimeout(snapTimer.current);
    // Web wheel scrolling does not always emit momentum-end events.
    snapTimer.current = setTimeout(snapToClosest, 150);
  }

  return (
    <View style={styles.wrapper} accessible accessibilityRole="adjustable" accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: items.length, now: selectedIndex + 1, text: items[selectedIndex] }}
      accessibilityActions={[{ name: 'increment', label: 'Siguiente' }, { name: 'decrement', label: 'Anterior' }]}
      onAccessibilityAction={(event) => selectIndex(selectedIndex + (event.nativeEvent.actionName === 'increment' ? 1 : -1))}>
      <View pointerEvents="none" style={styles.selectedBox} />
      <ScrollView ref={listRef} showsVerticalScrollIndicator={false} nestedScrollEnabled
        snapToInterval={ITEM_HEIGHT} snapToAlignment="start" decelerationRate="fast"
        contentOffset={initialOffset} contentContainerStyle={styles.content}
        onContentSizeChange={() => {
          listRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
          readyRef.current = true;
        }}
        onScroll={handleScroll} scrollEventThrottle={16} onMomentumScrollEnd={snapToClosest}>
        {items.map((item, index) => <Pressable key={item} accessible={false}
          tabIndex={-1} style={styles.item} onPress={() => selectIndex(index)}>
          <Text style={[styles.text, index === selectedIndex && styles.selectedText]}>{item}</Text>
        </Pressable>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: 105, flexShrink: 1, height: ITEM_HEIGHT * 3, position: 'relative' },
  content: { paddingVertical: ITEM_HEIGHT },
  selectedBox: { position: 'absolute', top: ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT,
    backgroundColor: theme.colors.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.cardDepth },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  text: { ...theme.typography.body, fontSize: 26, lineHeight: 42, color: theme.colors.textMuted, fontVariant: ['tabular-nums'] },
  selectedText: { ...theme.typography.title, color: theme.colors.text, fontSize: 32 },
});
