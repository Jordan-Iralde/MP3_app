import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/store/playerStore';
import { favoritesService } from '@/services/favorites.service';
import { Track } from '@/types/Track';

interface FavoritesFilterProps {
  tracks: Track[];
  onFilteredTracksChange: (tracks: Track[]) => void;
  containerStyle?: any;
}

export function FavoritesFilter({
  tracks,
  onFilteredTracksChange,
  containerStyle,
}: FavoritesFilterProps) {
  const { showFavoritesOnly, setShowFavoritesOnly } = usePlayerStore();

  const favoriteUris = useMemo(() => {
    return new Set(favoritesService.getAllFavorites());
  }, []);

  const filteredTracks = useMemo(() => {
    if (!showFavoritesOnly) return tracks;
    return tracks.filter((track) => favoriteUris.has(track.uri));
  }, [tracks, showFavoritesOnly, favoriteUris]);

  React.useEffect(() => {
    onFilteredTracksChange(filteredTracks);
  }, [filteredTracks]);

  const handleToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  return (
    <ThemedView style={[styles.container, containerStyle]}>
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.button,
          showFavoritesOnly && styles.buttonActive,
          pressed && styles.buttonPressed,
        ]}
      >
        <Feather
          name="heart"
          size={18}
          color={showFavoritesOnly ? '#FF6B6B' : '#999999'}
          fill={showFavoritesOnly ? '#FF6B6B' : 'none'}
        />
        <ThemedText style={styles.label}>
          Favoritos {showFavoritesOnly && `(${filteredTracks.length})`}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  buttonPressed: {
    opacity: 0.6,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
