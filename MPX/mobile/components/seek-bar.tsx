import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (position: number) => void;
  isPlaying?: boolean;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
  isPlaying = false,
}) => {
  const width = Dimensions.get('window').width - 32; // Account for padding
  const thumbSize = 12;

  const thumbPosition = useSharedValue(0);
  const isDragging = useRef(false);

  // Update thumb position when current time changes (only if not dragging)
  useEffect(() => {
    if (!isDragging.current && duration > 0) {
      const ratio = currentTime / duration;
      thumbPosition.value = ratio * (width - thumbSize);
    }
  }, [currentTime, duration, width, thumbSize]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.current = true;
    })
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(event.absoluteX - 16, width - thumbSize));
      thumbPosition.value = newPosition;
    })
    .onEnd(() => {
      isDragging.current = false;
      const ratio = thumbPosition.value / (width - thumbSize);
      const seekPosition = Math.max(0, Math.min(ratio * duration, duration));
      onSeek(seekPosition);
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    left: thumbPosition.value,
  }));

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const progressWidth = progressRatio * (width - thumbSize);

  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        {/* Background track */}
        <View
          style={[
            styles.track,
            {
              width: width,
            },
          ]}
        />

        {/* Progress track */}
        <View
          style={[
            styles.progress,
            {
              width: progressWidth,
            },
          ]}
        />

        {/* Draggable thumb */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
              },
              thumbAnimatedStyle,
            ]}
          />
        </GestureDetector>
      </View>

      {/* Time display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
  },
  track: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progress: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
