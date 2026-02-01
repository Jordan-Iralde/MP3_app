import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
  View,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Track } from '@/types/Track';
import { playlistsService, Playlist } from '@/services/playlists.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AddToPlaylistModalProps {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
  onPlaylistSelect?: (playlist: Playlist) => void;
}

export function AddToPlaylistModal({
  visible,
  track,
  onClose,
  onPlaylistSelect,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      playlistsService.ready().then(() => {
        const allPlaylists = playlistsService.getAllPlaylists();
        setPlaylists(allPlaylists);
      });

      const unsubscribe = playlistsService.subscribe((data) => {
        const allPlaylists = Object.values(data);
        setPlaylists(allPlaylists);
      });

      return unsubscribe;
    }
  }, [visible]);

  const handleAddToPlaylist = useCallback(
    async (playlist: Playlist) => {
      if (!track) return;

      try {
        setLoading(true);
        await playlistsService.addTrackToPlaylist(playlist.id, track);
        Alert.alert('Éxito', `"${track.title}" agregado a "${playlist.name}"`);
        onPlaylistSelect?.(playlist);
        onClose();
      } catch (error) {
        Alert.alert('Error', 'No se pudo agregar la canción a la playlist');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [track, onClose, onPlaylistSelect]
  );

  const renderPlaylistItem = useCallback(
    ({ item }: { item: Playlist }) => (
      <Pressable
        style={styles.playlistItem}
        onPress={() => handleAddToPlaylist(item)}
        disabled={loading}
      >
        <View style={styles.playlistInfo}>
          <MaterialCommunityIcons
            name="playlist-music"
            size={24}
            color="#FF6B6B"
          />
          <View style={styles.textContainer}>
            <ThemedText style={styles.playlistName}>{item.name}</ThemedText>
            <ThemedText style={styles.trackCount}>
              {item.tracks.length} canción{item.tracks.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        </View>
        <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B6B" />
      </Pressable>
    ),
    [loading, handleAddToPlaylist]
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Agregar a Playlist</ThemedText>
          <Pressable onPress={onClose} disabled={loading}>
            <MaterialCommunityIcons name="close" size={24} color="#007AFF" />
          </Pressable>
        </View>

        {track && (
          <View style={styles.trackInfo}>
            <ThemedText style={styles.trackTitle} numberOfLines={1}>
              {track.title}
            </ThemedText>
            <ThemedText style={styles.trackArtist} numberOfLines={1}>
              {track.artist}
            </ThemedText>
          </View>
        )}

        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="playlist-plus"
                size={48}
                color="#CCC"
              />
              <ThemedText style={styles.emptyText}>
                No hay playlists disponibles
              </ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  trackInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    opacity: 0.6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackCount: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 12,
  },
});
