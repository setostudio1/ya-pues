import { useRef, useState } from 'react';
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { theme } from '../constants/theme';

type Props = {
  items: string[];
  initialIndex?: number;
  onChange?: (value: string) => void;
};

const ITEM_HEIGHT = 64;

export default function DatePickerColumn({
  items,
  initialIndex = 0,
  onChange,
}: Props) {
  const listRef = useRef<FlatList<string>>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const selectClosestItem = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const index = Math.round(offsetY / ITEM_HEIGHT);

    const safeIndex = Math.max(
      0,
      Math.min(index, items.length - 1)
    );

    setSelectedIndex(safeIndex);

    listRef.current?.scrollToOffset({
      offset: safeIndex * ITEM_HEIGHT,
      animated: true,
    });

    onChange?.(items[safeIndex]);
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const index = Math.round(offsetY / ITEM_HEIGHT);

    const safeIndex = Math.max(
      0,
      Math.min(index, items.length - 1)
    );

    setSelectedIndex(safeIndex);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.selectedBox} />

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={selectClosestItem}
        onMomentumScrollEnd={selectClosestItem}
        renderItem={({ item, index }) => {
          const selected = index === selectedIndex;

          return (
            <View style={styles.item}>
              <Text
                style={[
                  styles.text,
                  selected && styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 105,
    height: ITEM_HEIGHT * 3,
    position: 'relative',
  },

  content: {
    paddingVertical: ITEM_HEIGHT,
  },

  selectedBox: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
  },

  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: theme.text.title,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },

  selectedText: {
    color: theme.colors.text,
  },
});