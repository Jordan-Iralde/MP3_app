import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Pressable,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { playlistsService, Playlist, PlaylistsData } from '@/services/playlists.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlaylistListProps {
  onPlaylistSelect: (playlist: Playlist) => void;
  onCreatePlaylist: (name: string) => void;
}

export function PlaylistList({ onPlaylistSelect, onCreatePlaylist }: PlaylistListProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    playlistsService.ready().then(() => {
      const allPlaylists = playlistsService.getAllPlaylists();
      setPlaylists(allPlaylists);
    });

    const unsubscribe = playlistsService.subscribe((data: PlaylistsData) => {
      const allPlaylists = Object.values(data);
      setPlaylists(allPlaylists);
    });

    return unsubscribe;
  }, []);

  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Nombre de playlist no puede estar vacío');
      return;
    }

    try {
      setLoading(true);
      await playlistsService.createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateForm(false);
      onCreatePlaylist(newPlaylistName);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la playlist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [newPlaylistName, onCreatePlaylist]);

  const handleRenamePlaylist = useCallback(
    async (playlistId: string) => {
      if (!editingName.trim()) {
        Alert.alert('Error', 'Nombre no puede estar vacío');
        return;
      }

      try {
        setLoading(true);
        await playlistsService.renamePlaylist(playlistId, editingName);
        setEditingId(null);
        setEditingName('');
      } catch (error) {
        Alert.alert('Error', 'No se pudo renombrar la playlist');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [editingName]
  );

  const handleDeletePlaylist = useCallback((playlistId: string, name: string) => {
    Alert.alert(
      'Eliminar Playlist',
      `¿Estás seguro de que deseas eliminar "${name}"?`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setLoading(true);
              await playlistsService.deletePlaylist(playlistId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la playlist');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  const renderPlaylistItem = useCallback(
    ({ item }: { item: Playlist }) => {
      if (editingId === item.id) {
        return (
          <ThemedView style={styles.editingContainer}>
            <TextInput
              style={styles.editInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Nombre de la playlist"
              editable={!loading}
            />
            <Pressable
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => handleRenamePlaylist(item.id)}
              disabled={loading}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditingId(null);
                setEditingName('');
              }}
              disabled={loading}
            >
              <MaterialCommunityIcons name="close" size={20} color="#FFF" />
            </Pressable>
          </ThemedView>
        );
      }

      return (
        <Pressable
          style={styles.playlistItem}
          onPress={() => onPlaylistSelect(item)}
        >
          <View style={styles.playlistInfo}>
            <MaterialCommunityIcons
              name="playlist-music"
              size={24}
              color="#FF6B6B"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <ThemedText style={styles.playlistName}>{item.name}</ThemedText>
              <ThemedText style={styles.trackCount}>
                {item.tracks.length} canción{item.tracks.length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setEditingId(item.id);
                setEditingName(item.name);
              }}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#007AFF" />
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeletePlaylist(item.id, item.name)}
            >
              <MaterialCommunityIcons name="trash-can" size={18} color="#FF6B6B" />
            </Pressable>
          </View>
        </Pressable>
      );
    },
    [editingId, editingName, loading, onPlaylistSelect, handleRenamePlaylist, handleDeletePlaylist]
  );

  return (
    <ThemedView style={styles.container}>
      {showCreateForm && (
        <ThemedView style={styles.createFormContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la nueva playlist"
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            editable={!loading}
          />
          <View style={styles.formButtons}>
            <Pressable
              style={[styles.button, styles.createButton]}
              onPress={handleCreatePlaylist}
              disabled={loading}
            >
              <ThemedText style={styles.buttonText}>Crear</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancelFormButton]}
              onPress={() => {
                setShowCreateForm(false);
                setNewPlaylistName('');
              }}
              disabled={loading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="playlist-plus"
              size={48}
              color="#CCC"
              style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyText}>
              No hay playlists aún
            </ThemedText>
          </ThemedView>
        }
        ListHeaderComponent={
          !showCreateForm ? (
            <Pressable
              style={styles.createButton}
              onPress={() => setShowCreateForm(true)}
            >
              <MaterialCommunityIcons name="plus-circle" size={24} color="#FFF" />
              <ThemedText style={styles.createButtonText}>
                Nueva Playlist
              </ThemedText>
            </Pressable>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4FF',
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  createFormContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
    backgroundColor: '#0a0a0a',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#1a1a1a',
    color: '#FFF',
    fontWeight: '600',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonStyle: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cancelFormButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    backgroundColor: '#0a0a0a',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  icon: {
    marginRight: 4,
  },
  textContainer: {
    flex: 1,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    color: '#FFF',
  },
  trackCount: {
    fontSize: 12,
    opacity: 0.5,
    color: '#AAA',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4FF15',
    borderWidth: 1,
    borderColor: '#00D4FF30',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B15',
    borderColor: '#FF6B6B30',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    gap: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
