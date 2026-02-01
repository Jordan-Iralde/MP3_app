import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { usePlayerStore } from '@/store/playerStore';
import { useRouter } from 'expo-router';

interface MiniPlayerProps {
  onExpand?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    miniPlayerVisible,
    setMiniPlayerVisible,
  } = usePlayerStore();

  const { audioPlayerService } = require('@/services/audioPlayer.service');

  if (!currentTrack || !miniPlayerVisible) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      audioPlayerService.pause();
    } else {
      audioPlayerService.play();
    }
  };

  const handleNextTrack = () => {
    // Implement next track logic through context or service
    // This will be handled by PlayerContext
  };

  const handleExpand = () => {
    onExpand?.();
    // Optional: navigate if a route exists, otherwise just call callback
    try {
      router.push('/' as any);
    } catch (e) {
      console.warn('Player route not available');
    }
  };

  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={SlideOutDown}
      layout={Layout}
      style={styles.container}
    >
      <Pressable style={styles.content} onPress={handleExpand}>
        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist || 'Unknown Artist'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={handlePlayPause} hitSlop={8}>
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#FF6B6B"
            />
          </Pressable>

          <Pressable onPress={handleNextTrack} hitSlop={8}>
            <Feather name="skip-forward" size={20} color="#FF6B6B" />
          </Pressable>
        </View>
      </Pressable>

      {/* Progress indicator */}
      <View style={styles.progressBar} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF6B6B',
  },
});
