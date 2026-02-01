import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/utils/formatDuration';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface PlayerProps {
  onClose: () => void;
}

export function Player({ onClose }: PlayerProps) {
  const { playerState, play, pause, next, previous, seek, shuffle, setShuffle, repeatMode, setRepeatMode } = usePlayer();

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
      console.warn('Play/pause error:', error);
    }
  };

  const handleNext = async () => {
    try {
      await next();
    } catch (error) {
      console.warn('Next error:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      await previous();
    } catch (error) {
      console.warn('Previous error:', error);
    }
  };

  const handleSeek = async (position: number) => {
    try {
      await seek(position);
    } catch (error) {
      console.warn('Seek error:', error);
    }
  };

  const handleShuffleToggle = () => {
    setShuffle(!shuffle);
  };

  const handleRepeatToggle = () => {
    const modes: Array<'OFF' | 'ONE' | 'ALL'> = ['OFF', 'ONE', 'ALL'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const progressPercent =
    playerState.duration > 0 ? Math.max(0, Math.min(1, playerState.position / playerState.duration)) : 0;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Now Playing</ThemedText>
        <View style={styles.closeButtonPlaceholder} />
      </ThemedView>

      {/* Track Info */}
      <ThemedView style={styles.trackInfoContainer}>
        <ThemedView style={styles.albumArt}>
          <ThemedText style={styles.albumArtIcon}>♪</ThemedText>
        </ThemedView>

        <ThemedText style={styles.trackTitle} numberOfLines={2}>
          {playerState.currentTrack.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {playerState.currentTrack.artist}
        </ThemedText>
      </ThemedView>

      {/* Progress Bar */}
      <ThemedView style={styles.progressContainer}>
        <Pressable
          style={styles.progressBar}
          onPress={(e) => {
            const { width } = e.currentTarget as any;
            const { pageX } = e.nativeEvent;
            const newPosition = (pageX / width) * playerState.duration;
            handleSeek(newPosition);
          }}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent * 100}%` },
            ]}
          />
        </Pressable>

        <ThemedView style={styles.timeDisplay}>
          <ThemedText style={styles.timeText}>
            {formatDuration(playerState.position)}
          </ThemedText>
          <ThemedText style={styles.timeText}>
            {formatDuration(playerState.duration)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Main Controls */}
      <ThemedView style={styles.controlsContainer}>
        <Pressable
          style={[styles.controlButton, shuffle && styles.controlButtonActive]}
          onPress={handleShuffleToggle}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <ThemedText style={[styles.controlText, shuffle && styles.controlTextActive]}>
            🔀
          </ThemedText>
        </Pressable>

        <Pressable
          style={styles.controlButton}
          onPress={handlePrevious}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <ThemedText style={styles.controlText}>⏮</ThemedText>
        </Pressable>

        <View style={styles.playButtonContainer}>
          {playerState.isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Pressable
              style={styles.playButton}
              onPress={handlePlayPause}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            >
              <ThemedText style={styles.playButtonText}>
                {playerState.isPlaying ? '⏸' : '▶'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.controlButton}
          onPress={handleNext}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <ThemedText style={styles.controlText}>⏭</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.controlButton, repeatMode !== 'OFF' && styles.controlButtonActive]}
          onPress={handleRepeatToggle}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <ThemedText style={[styles.controlText, repeatMode !== 'OFF' && styles.controlTextActive]}>
            {repeatMode === 'ONE' ? '🔂' : '🔁'}
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* Repeat indicator */}
      {repeatMode !== 'OFF' && (
        <ThemedView style={styles.repeatIndicator}>
          <ThemedText style={styles.repeatIndicatorText}>
            {repeatMode === 'ONE' ? 'Repeat: One' : 'Repeat: All'}
          </ThemedText>
        </ThemedView>
      )}

      {/* Error Display */}
      {playerState.error && (
        <ThemedView style={styles.errorBox}>
          <ThemedText style={styles.errorText}>{playerState.error}</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    height: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    opacity: 0.6,
  },
  closeButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  albumArtIcon: {
    fontSize: 80,
    opacity: 0.3,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  trackArtist: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#007AFF',
    borderRadius: 24,
  },
  controlText: {
    fontSize: 24,
  },
  controlTextActive: {
    color: '#FFFFFF',
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  repeatIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
    marginBottom: 12,
  },
  repeatIndicatorText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  errorText: {
    fontSize: 12,
    color: '#C53030',
  },
});
