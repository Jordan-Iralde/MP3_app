import React, { useState, useCallback, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { PlaylistList } from '@/components/playlist-list';
import { PlaylistDetail } from '@/components/playlist-detail';
import { Playlist } from '@/services/playlists.service';
import { PlayerContext } from '@/context/PlayerContext';
import { usePlayer } from '@/context/PlayerContext';
import { Track } from '@/types/Track';

export default function PlaylistsScreen() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const { playTrack } = usePlayer();
  
  // Get all tracks from player context for adding to playlists
  const playerContext = useContext(PlayerContext);
  const allTracks = playerContext?.queue || [];

  const handlePlaylistSelect = useCallback((playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPlaylist(null);
  }, []);

  const handleTrackSelect = useCallback(
    async (track: Track) => {
      if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
        await playTrack(track, selectedPlaylist.tracks);
      }
    },
    [playTrack, selectedPlaylist]
  );

  if (selectedPlaylist) {
    return (
      <ThemedView style={styles.container}>
        <PlaylistDetail
          playlist={selectedPlaylist}
          availableTracks={allTracks}
          onTrackSelect={handleTrackSelect}
          onBack={handleBack}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PlaylistList
        onPlaylistSelect={handlePlaylistSelect}
        onCreatePlaylist={() => {}}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
