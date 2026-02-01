import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  Modal,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/utils/formatDuration';
import { SleepTimerButton } from '@/components/sleep-timer';
import { QueueScreen } from '@/components/queue-screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EnhancedMiniPlayerProps {
  onExpand?: () => void;
}

export function MiniPlayer({ onExpand }: EnhancedMiniPlayerProps) {
  const { playerState, queue, currentIndex, play, pause } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  // Don't render if no track is loaded
  if (!playerState.currentTrack) {
    return null;
  }

  const handlePlayPause = async () => {
    try {
      if (playerState.isPlaying) {
        await pause();
      } else {
        await play();
      }
    } catch (error) {
      console.warn('Error toggling playback:', error);
    }
  };

  const progressPercent =
    playerState.duration > 0
      ? Math.max(0, Math.min(1, playerState.position / playerState.duration))
      : 0;

  const queueInfo = `${currentIndex + 1}/${queue.length}`;

  const handlePress = () => {
    onExpand?.();
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <ThemedView style={styles.container}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent * 100}%` },
              ]}
            />
          </View>

          {/* Content */}
          <ThemedView style={styles.content}>
            {/* Track info */}
            <ThemedView style={styles.trackInfo}>
              <ThemedText style={styles.trackTitle} numberOfLines={1}>
                {playerState.currentTrack.title}
              </ThemedText>
              <ThemedText style={styles.trackArtist} numberOfLines={1}>
                {playerState.currentTrack.artist}
              </ThemedText>
            </ThemedView>

            {/* Queue indicator */}
            {queue.length > 0 && (
              <Pressable
                style={styles.queueButton}
                onPress={() => setShowQueue(true)}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <MaterialCommunityIcons
                  name="playlist-play"
                  size={16}
                  color="#007AFF"
                />
                <ThemedText style={styles.queueText}>{queueInfo}</ThemedText>
              </Pressable>
            )}

            {/* Time */}
            <ThemedText style={styles.timeText}>
              {formatDuration(playerState.position)}
            </ThemedText>

            {/* Play button */}
            <Pressable
              style={styles.playButton}
              onPress={handlePlayPause}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', radius: 20 }}
            >
              <ThemedText style={styles.playButtonText}>
                {playerState.isPlaying ? '⏸' : '▶'}
              </ThemedText>
            </Pressable>

            {/* Sleep timer button */}
            <SleepTimerButton />
          </ThemedView>
        </ThemedView>
      </Pressable>

      {/* Queue modal */}
      <Modal
        visible={showQueue}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQueue(false)}
      >
        <QueueScreen onClose={() => setShowQueue(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  trackInfo: {
    flex: 1,
    marginRight: 4,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    color: '#FFF',
  },
  trackArtist: {
    fontSize: 11,
    opacity: 0.7,
    color: '#AAA',
  },
  queueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#00D4FF15',
    gap: 5,
    borderWidth: 1,
    borderColor: '#00D4FF30',
  },
  queueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D4FF',
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
    fontVariant: ['tabular-nums'],
    minWidth: 32,
    color: '#AAA',
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: '#00D4FF',
    marginLeft: 4,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
