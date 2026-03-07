import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/utils/formatDuration';
import { Track } from '@/types/Track';

interface PlaylistPlayerProps {
  tracks: Track[];
  playlistName?: string;
  onClose?: () => void;
  showHeader?: boolean;
}

export const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  tracks,
  playlistName = 'Playlist',
  onClose,
  showHeader = true,
}) => {
  const { playerState, playTrack, nextTrack, previousTrack } = usePlayer();
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const currentTrackIndex = useMemo(() => {
    return tracks.findIndex((t) => t.id === playerState.currentTrack?.id);
  }, [tracks, playerState.currentTrack?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const handleTrackPress = async (track: Track) => {
    try {
      await playTrack(track, tracks);
      animatePress();
    } catch (error) {
      console.warn('Error playing track:', error);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => {
    const isCurrentTrack = item.id === playerState.currentTrack?.id;
    const isPlaying = isCurrentTrack && playerState.isPlaying;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.trackItem,
          isCurrentTrack && styles.trackItemActive,
          pressed && styles.trackItemPressed,
        ]}
        onPress={() => handleTrackPress(item)}
      >
        {/* Index / Playing indicator */}
        <View style={styles.trackIndexContainer}>
          {isPlaying ? (
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <MaterialCommunityIcons name="music" size={18} color="#00D4FF" />
            </Animated.View>
          ) : (
            <ThemedText style={styles.trackIndex}>{index + 1}</ThemedText>
          )}
        </View>

        {/* Track info */}
        <View style={styles.trackInfoContainer}>
          <ThemedText
            style={[styles.trackTitle, isCurrentTrack && styles.trackTitleActive]}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1}>
            {item.artist || 'Artista desconocido'}
          </ThemedText>
        </View>

        {/* Duration / Progress */}
        <View style={styles.trackDurationContainer}>
          {isCurrentTrack && playerState.duration > 0 ? (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(playerState.position / playerState.duration) * 100}%`,
                  },
                ]}
              />
            </View>
          ) : (
            <ThemedText style={styles.duration}>{formatDuration(item.duration)}</ThemedText>
          )}
        </View>

        {/* Play button */}
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            isCurrentTrack && styles.playButtonActive,
            pressed && styles.playButtonPressed,
          ]}
          onPress={() => handleTrackPress(item)}
        >
          <Feather
            name={isCurrentTrack && playerState.isPlaying ? 'pause' : 'play'}
            size={16}
            color={isCurrentTrack ? '#000' : '#00D4FF'}
          />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.playlistName}>{playlistName}</ThemedText>
            <ThemedText style={styles.trackCount}>{tracks.length} canciones</ThemedText>
          </View>
          {onClose && (
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
              onPress={onClose}
            >
              <Feather name="x" size={24} color="#00D4FF" />
            </Pressable>
          )}
        </View>
      )}

      {/* Current track progress */}
      {playerState.currentTrack && tracks.includes(playerState.currentTrack) && (
        <View style={styles.currentTrackProgressContainer}>
          <ThemedText style={styles.currentTime}>
            {formatDuration(playerState.position)}
          </ThemedText>
          <View style={styles.progressBarLarge}>
            <View
              style={[
                styles.progressFillLarge,
                {
                  width: `${(playerState.position / playerState.duration) * 100}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.totalTime}>
            {formatDuration(playerState.duration)}
          </ThemedText>
        </View>
      )}

      {/* Playlist tracks */}
      {tracks.length > 0 ? (
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            currentTrackIndex !== -1 ? (
              <View style={styles.nowPlayingIndicator}>
                <MaterialCommunityIcons name="music-circle" size={16} color="#00D4FF" />
                <ThemedText style={styles.nowPlayingText}>Reproduciendo ahora</ThemedText>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="music-box-outline" size={48} color="#AAA" />
          <ThemedText style={styles.emptyText}>No hay canciones en esta playlist</ThemedText>
        </View>
      )}

      {/* Controls */}
      {tracks.length > 0 && (
        <View style={styles.controlsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={previousTrack}
            disabled={currentTrackIndex <= 0}
          >
            <Feather name="skip-back" size={20} color={currentTrackIndex <= 0 ? '#555' : '#00D4FF'} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.playAllButton,
              pressed && styles.playAllButtonPressed,
            ]}
            onPress={() => tracks.length > 0 && handleTrackPress(tracks[0])}
          >
            <MaterialCommunityIcons
              name={playerState.isPlaying ? 'pause-circle' : 'play-circle'}
              size={24}
              color="#000"
            />
            <ThemedText style={styles.playAllText}>
              {playerState.isPlaying ? 'Pausar' : 'Reproducir'}
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={nextTrack}
            disabled={currentTrackIndex >= tracks.length - 1}
          >
            <Feather
              name="skip-forward"
              size={20}
              color={currentTrackIndex >= tracks.length - 1 ? '#555' : '#00D4FF'}
            />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  trackCount: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  closeButtonPressed: {
    backgroundColor: '#00D4FF15',
  },
  currentTrackProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  progressBarLarge: {
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  currentTime: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
  },
  totalTime: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    borderColor: '#1a1a1a',
    borderWidth: 1,
    gap: 10,
  },
  trackItemActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#00D4FF30',
  },
  trackItemPressed: {
    backgroundColor: '#00D4FF10',
  },
  trackIndexContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AAA',
  },
  trackInfoContainer: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  trackTitleActive: {
    color: '#00D4FF',
  },
  trackArtist: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
  },
  trackDurationContainer: {
    minWidth: 50,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
  },
  duration: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
    textAlign: 'right',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#00D4FF',
  },
  playButtonPressed: {
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopColor: '#1a1a1a',
    borderTopWidth: 1,
    backgroundColor: '#0a0a0a',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  controlButtonPressed: {
    backgroundColor: '#00D4FF15',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00D4FF',
  },
  playAllButtonPressed: {
    opacity: 0.8,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '600',
    textAlign: 'center',
  },
  nowPlayingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  nowPlayingText: {
    fontSize: 12,
    color: '#00D4FF',
    fontWeight: '600',
  },
});
