import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStoragePermission } from '@/hooks/use-storage-permission';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { fetchAudioTracks } from '@/services/mediaLibrary.service';
import { formatDuration } from '@/utils/formatDuration';
import { Player } from '@/components/player';
import { Track } from '@/types/Track';

export default function HomeScreen() {
  const { isGranted, isLoading: isPermissionLoading, error: permissionError } = useStoragePermission();
  const { state: playerState, loadTrack } = useAudioPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [tracksError, setTracksError] = useState<Error | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    if (!isGranted) {
      return;
    }

    async function loadTracks() {
      try {
        setIsLoadingTracks(true);
        setTracksError(null);
        const audioTracks = await fetchAudioTracks();
        setTracks(audioTracks);
      } catch (err) {
        setTracksError(err instanceof Error ? err : new Error('Failed to load tracks'));
      } finally {
        setIsLoadingTracks(false);
      }
    }

    loadTracks();
  }, [isGranted]);

  const handleTrackPress = async (track: Track) => {
    try {
      await loadTrack(track);
      setIsPlayerOpen(true);
    } catch (error) {
      console.warn('Error loading track:', error);
    }
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <Pressable onPress={() => handleTrackPress(item)}>
      <ThemedView style={styles.trackItem}>
        <ThemedView style={styles.trackInfo}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.trackDuration}>
          {formatDuration(item.duration)}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        No music files found
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Add some MP3 files to your device to see them here.
      </ThemedText>
    </ThemedView>
  );

  // Show player if open
  if (isPlayerOpen) {
    return <Player onClose={() => setIsPlayerOpen(false)} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Resonix
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {tracks.length > 0 ? `${tracks.length} tracks` : 'Your offline-first MP3 player'}
        </ThemedText>
      </ThemedView>

      {isPermissionLoading && (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.statusText}>
            Checking permissions...
          </ThemedText>
        </ThemedView>
      )}

      {!isPermissionLoading && permissionError && (
        <ThemedView style={styles.centerContent}>
          <ThemedView style={styles.errorBox}>
            <ThemedText style={styles.errorText}>
              ⚠️ Permission Error
            </ThemedText>
            <ThemedText style={styles.errorDescription}>
              {permissionError.message}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {!isPermissionLoading && !permissionError && !isGranted && (
        <ThemedView style={styles.centerContent}>
          <ThemedView style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              ⚙️ Permissions Required
            </ThemedText>
            <ThemedText style={styles.warningDescription}>
              Storage access is needed to read your music files.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {!isPermissionLoading && isGranted && isLoadingTracks && (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.statusText}>
            Loading your music...
          </ThemedText>
        </ThemedView>
      )}

      {!isPermissionLoading && isGranted && !isLoadingTracks && tracksError && (
        <ThemedView style={styles.centerContent}>
          <ThemedView style={styles.errorBox}>
            <ThemedText style={styles.errorText}>
              ⚠️ Error Loading Tracks
            </ThemedText>
            <ThemedText style={styles.errorDescription}>
              {tracksError.message}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {!isPermissionLoading && isGranted && !isLoadingTracks && !tracksError && (
        <FlatList
          data={tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={tracks.length === 0 ? styles.emptyList : undefined}
          style={styles.list}
        />
      )}

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.versionText}>
          v0.3 — Basic playback
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    opacity: 0.6,
  },
  trackDuration: {
    fontSize: 14,
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 16,
    marginTop: 12,
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
    maxWidth: 400,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#E53E3E',
  },
  errorDescription: {
    fontSize: 14,
    color: '#C53030',
  },
  warningBox: {
    backgroundColor: '#FFFAF0',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ED8936',
    maxWidth: 400,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ED8936',
  },
  warningDescription: {
    fontSize: 14,
    color: '#DD6B20',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  versionText: {
    fontSize: 11,
    opacity: 0.4,
  },
});
