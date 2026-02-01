import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, GestureResponderEvent, Alert, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Track } from '@/types/Track';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export interface DraggableTrackListProps {
  tracks: Track[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  canDrag?: boolean;
}

interface DragState {
  isDragging: boolean;
  dragIndex: number | null;
  offsetY: number;
}

export function DraggableTrackList({ tracks, onReorder, onRemove, canDrag = true }: DraggableTrackListProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragIndex: null,
    offsetY: 0,
  });

  const animationValue = useRef(new Animated.Value(1)).current;

  const handleDragStart = (index: number, event: GestureResponderEvent) => {
    if (!canDrag) return;

    setDragState({
      isDragging: true,
      dragIndex: index,
      offsetY: event.nativeEvent.pageY,
    });

    Animated.spring(animationValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleDragMove = (event: GestureResponderEvent) => {
    if (!dragState.isDragging || dragState.dragIndex === null) return;

    const currentY = event.nativeEvent.pageY;
    const dragDistance = currentY - dragState.offsetY;

    // Estimate which item should be moved
    const itemHeight = 70; // Approximate height of track item
    const potentialIndex = dragState.dragIndex + Math.round(dragDistance / itemHeight);

    if (potentialIndex !== dragState.dragIndex && potentialIndex >= 0 && potentialIndex < tracks.length) {
      onReorder(dragState.dragIndex, potentialIndex);
      setDragState({
        ...dragState,
        dragIndex: potentialIndex,
        offsetY: currentY,
      });
    }
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      dragIndex: null,
      offsetY: 0,
    });

    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      scrollEnabled={!dragState.isDragging}
      onMoveShouldSetResponder={() => dragState.isDragging}
      onResponderMove={handleDragMove}
      onResponderRelease={handleDragEnd}
    >
      {tracks.map((track, index) => (
        <Animated.View
          key={`${track.uri}-${index}`}
          style={{
            transform: dragState.dragIndex === index ? [{ scale: animationValue }] : [],
            opacity: dragState.isDragging && dragState.dragIndex === index ? 0.7 : 1,
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#1a1a1a',
              backgroundColor: dragState.dragIndex === index ? '#00D4FF10' : '#0a0a0a',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {canDrag && (
              <TouchableOpacity
                onPressIn={(event) => handleDragStart(index, event)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="menu" size={20} color="#00D4FF" opacity={0.5} />
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1} style={{ fontWeight: '700', color: '#FFF' }}>
                {track.title}
              </ThemedText>
              <ThemedText numberOfLines={1} style={{ opacity: 0.5, fontSize: 12, color: '#AAA' }}>
                {track.artist}
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={() => {
                Alert.alert('Remove Track', `Remove "${track.title}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    onPress: () => onRemove(index),
                    style: 'destructive',
                  },
                ]);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
