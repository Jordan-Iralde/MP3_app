import React, { memo, useMemo, useCallback } from 'react';
import { FlatList, StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FavoriteButton } from '@/components/favorite-button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/formatDuration';
import { Track } from '@/types/Track';

interface OptimizedTrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  isLoading: boolean;
  onTrackPress: (track: Track) => void;
  onTrackLongPress?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  contentInset?: { bottom: number };
}

interface TrackItemProps {
  track: Track;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onAddToPlaylist?: (track: Track) => void;
}

/**
 * Memoized track item component with favorite button
 */
const TrackItem = memo(function TrackItem({
  track,
  isActive,
  onPress,
  onLongPress,
  onAddToPlaylist,
}: TrackItemProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.trackItem,
        isActive && styles.trackItemActive,
        pressed && styles.trackItemPressed,
      ]}
    >
      <ThemedView style={styles.trackInfo}>
        <ThemedText
          style={[styles.trackTitle, isActive && styles.trackTitleActive]}
          numberOfLines={1}
        >
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.trackDuration}>
        {formatDuration(track.duration)}
      </ThemedText>
      <FavoriteButton trackUri={track.uri} size={20} />
      {onAddToPlaylist && (
        <Pressable
          style={styles.addButton}
          onPress={() => onAddToPlaylist(track)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FF6B6B" />
        </Pressable>
      )}
    </Pressable>
  );
});

/**
 * Optimized track list with favorites support
 */
export const OptimizedTrackList = memo(function OptimizedTrackList({
  tracks,
  currentTrackId,
  isLoading,
  onTrackPress,
  onTrackLongPress,
  onAddToPlaylist,
  ListHeaderComponent,
  ListEmptyComponent,
  contentInset,
}: OptimizedTrackListProps) {
  const keyExtractor = useCallback((item: Track) => item.id, []);

  const renderTrack = useCallback(
    ({ item }: { item: Track }) => (
      <TrackItem
        track={item}
        isActive={item.id === currentTrackId}
        onPress={() => onTrackPress(item)}
        onLongPress={onTrackLongPress ? () => onTrackLongPress(item) : undefined}
        onAddToPlaylist={onAddToPlaylist}
      />
    ),
    [currentTrackId, onTrackPress, onTrackLongPress, onAddToPlaylist]
  );

  return (
    <FlatList
      data={tracks}
      renderItem={renderTrack}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentInset={contentInset}
      scrollEnabled={true}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={20}
      windowSize={10}
      style={styles.list}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  trackItemActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 12,
  },
  trackItemPressed: {
    opacity: 0.7,
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
  trackTitleActive: {
    fontWeight: '700',
    color: '#007AFF',
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
  addButton: {
    padding: 4,
    marginLeft: 4,
  },
});

