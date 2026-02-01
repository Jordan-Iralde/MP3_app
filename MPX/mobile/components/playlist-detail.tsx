import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Pressable,
  View,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { playlistsService, Playlist } from '@/services/playlists.service';
import { Track } from '@/types/Track';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDuration } from '@/utils/formatDuration';
import { DraggableTrackList } from '@/components/draggable-track-list';

interface PlaylistDetailProps {
  playlist: Playlist;
  availableTracks: Track[];
  onTrackSelect: (track: Track) => void;
  onBack: () => void;
}

export function PlaylistDetail({
  playlist,
  availableTracks,
  onTrackSelect,
  onBack,
}: PlaylistDetailProps) {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);
  const [showAddTracks, setShowAddTracks] = useState(false);

  useEffect(() => {
    const unsubscribe = playlistsService.subscribe((data) => {
      const updated = data[playlist.id];
      if (updated) {
        setCurrentPlaylist(updated);
      }
    });

    return unsubscribe;
  }, [playlist.id]);

  const tracksNotInPlaylist = useMemo(
    () =>
      availableTracks.filter(
        (track) =>
          !currentPlaylist.tracks.some((t) => t.uri === track.uri)
      ),
    [availableTracks, currentPlaylist.tracks]
  );

  const handleAddTrack = useCallback(
    async (track: Track) => {
      try {
        await playlistsService.addTrackToPlaylist(playlist.id, track);
        setShowAddTracks(false);
      } catch (error) {
        Alert.alert('Error', 'No se pudo agregar la canción');
        console.error(error);
      }
    },
    [playlist.id]
  );

  const handleRemoveTrack = useCallback(
    (trackUri: string, trackTitle: string) => {
      Alert.alert(
        'Remover canción',
        `¿Remover "${trackTitle}" de esta playlist?`,
        [
          { text: 'Cancelar', onPress: () => {} },
          {
            text: 'Remover',
            onPress: async () => {
              try {
                await playlistsService.removeTrackFromPlaylist(
                  playlist.id,
                  trackUri
                );
              } catch (error) {
                Alert.alert('Error', 'No se pudo remover la canción');
                console.error(error);
              }
            },
            style: 'destructive',
          },
        ]
      );
    },
    [playlist.id]
  );

  const handleReorderTracks = useCallback(
    async (fromIndex: number, toIndex: number) => {
      try {
        const newTracks = [...currentPlaylist.tracks];
        const [movedTrack] = newTracks.splice(fromIndex, 1);
        newTracks.splice(toIndex, 0, movedTrack);
        
        // Update playlist with reordered tracks
        await playlistsService.updatePlaylistTracks(playlist.id, newTracks);
      } catch (error) {
        Alert.alert('Error', 'No se pudo reordenar las canciones');
        console.error(error);
      }
    },
    [playlist.id, currentPlaylist.tracks]
  );

  const renderTrackItem = useCallback(
    ({ item }: { item: Track }) => (
      <Pressable
        style={styles.trackItem}
        onPress={() => onTrackSelect(item)}
      >
        <View style={styles.trackInfo}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </ThemedText>
        </View>
        <ThemedText style={styles.trackDuration}>
          {formatDuration(item.duration)}
        </ThemedText>
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveTrack(item.uri, item.title)}
        >
          <MaterialCommunityIcons name="close-circle" size={20} color="#FF6B6B" />
        </Pressable>
      </Pressable>
    ),
    [onTrackSelect, handleRemoveTrack]
  );

  const renderDraggableList = useCallback(
    () => (
      <DraggableTrackList
        tracks={currentPlaylist.tracks}
        onReorder={handleReorderTracks}
        onRemove={(index) => {
          const track = currentPlaylist.tracks[index];
          handleRemoveTrack(track.uri, track.title);
        }}
        canDrag={currentPlaylist.tracks.length > 1}
      />
    ),
    [currentPlaylist.tracks, handleReorderTracks, handleRemoveTrack]
  );

  const renderAddTrackItem = useCallback(
    ({ item }: { item: Track }) => (
      <Pressable
        style={styles.addTrackItem}
        onPress={() => handleAddTrack(item)}
      >
        <View style={styles.trackInfo}>
          <ThemedText style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </ThemedText>
        </View>
        <Pressable style={styles.addButton}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B6B" />
        </Pressable>
      </Pressable>
    ),
    [handleAddTrack]
  );

  if (showAddTracks) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => setShowAddTracks(false)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
            <ThemedText style={styles.backText}>Atrás</ThemedText>
          </Pressable>
          <ThemedText style={styles.headerTitle}>Agregar canciones</ThemedText>
        </View>

        <FlatList
          data={tracksNotInPlaylist}
          renderItem={renderAddTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                Todas las canciones están en esta playlist
              </ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
          <ThemedText style={styles.backText}>Atrás</ThemedText>
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle}>{currentPlaylist.name}</ThemedText>
          <ThemedText style={styles.trackCountText}>
            {currentPlaylist.tracks.length} canción{currentPlaylist.tracks.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>

      {currentPlaylist.tracks.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="music-box-outline"
            size={48}
            color="#CCC"
            style={styles.emptyIcon}
          />
          <ThemedText style={styles.emptyText}>
            Esta playlist está vacía
          </ThemedText>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddTracks(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <ThemedText style={styles.addButtonText}>Agregar canciones</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <View style={styles.list}>
          {renderDraggableList()}
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddTracks(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            <ThemedText style={styles.addButtonText}>Agregar canciones</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#00D4FF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  trackCountText: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 3,
    color: '#AAA',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
    gap: 10,
  },
  addTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#00D4FF15',
    borderWidth: 1,
    borderColor: '#00D4FF30',
    gap: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  trackArtist: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
    color: '#AAA',
  },
  trackDuration: {
    fontSize: 12,
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
    color: '#888',
  },
  removeButton: {
    padding: 6,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#00D4FF',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.4,
    color: '#FFF',
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});
