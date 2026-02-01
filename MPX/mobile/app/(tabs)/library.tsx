import React from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStoragePermission } from '@/hooks/use-storage-permission';
import { useLocalMusicLibrary } from '@/hooks/use-local-music-library';
import { formatDuration } from '@/utils/formatDuration';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Library Screen - Browse local audio files on the device
 */
export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const { isGranted, isLoading: permissionLoading } = useStoragePermission();
  const { songs, isLoading: scanLoading, error, refetch } = useLocalMusicLibrary(isGranted);

  const isLoading = permissionLoading || scanLoading;

  // Permission not granted state
  if (!permissionLoading && !isGranted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ThemedText type="title" style={styles.centerText}>
            📁 Storage Access Required
          </ThemedText>
          <ThemedText style={styles.centerDescription}>
            Grant permission to access your music library
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Scanning library...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ThemedText type="title" style={styles.centerText}>
            ⚠️ Error
          </ThemedText>
          <ThemedText style={styles.errorText}>{error.message}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={refetch}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  // Empty state
  if (songs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ThemedText type="title" style={styles.centerText}>
            🎵 No Audio Files Found
          </ThemedText>
          <ThemedText style={styles.centerDescription}>
            No MP3 files detected on your device
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={refetch}>
            <ThemedText style={styles.retryButtonText}>Rescan</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  // Songs list
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">🎵 Library</ThemedText>
        <ThemedText style={styles.songCount}>{songs.length} songs</ThemedText>
      </ThemedView>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.songItem,
              { borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault },
            ]}>
            <ThemedView style={styles.songInfo}>
              <ThemedText style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.songArtist} numberOfLines={1}>
                {item.artist}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.songDuration}>{formatDuration(item.duration)}</ThemedText>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  songCount: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.5,
    fontWeight: '600',
    color: '#AAA',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  centerDescription: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
    marginBottom: 24,
    color: '#AAA',
  },
  loadingText: {
    marginTop: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 12,
    opacity: 0.6,
    color: '#FF6B6B',
  },
  retryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#00D4FF',
  },
  retryButtonText: {
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  songItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
    color: '#FFF',
  },
  songArtist: {
    fontSize: 12,
    opacity: 0.6,
    color: '#AAA',
  },
  songDuration: {
    fontSize: 12,
    opacity: 0.5,
    minWidth: 40,
    textAlign: 'right',
    color: '#888',
    fontWeight: '600',
  },
});
