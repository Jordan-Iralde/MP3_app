import { StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/utils/formatDuration';

interface MiniPlayerProps {
  onExpand: () => void;
}

export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { playerState, play, pause } = usePlayer();

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

  return (
    <Pressable onPress={onExpand}>
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
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
    opacity: 0.6,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
    fontVariant: ['tabular-nums'],
    minWidth: 35,
  },
  playButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
