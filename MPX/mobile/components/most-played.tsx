import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ListRenderItem,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePlayerStore } from '@/store/playerStore';
import { Track } from '@/types/Track';

interface MostPlayedProps {
  onTrackPress?: (track: Track) => void;
}

interface MostPlayedItem {
  track: Track;
  playCount: number;
}

export const MostPlayedSection: React.FC<MostPlayedProps> = ({ onTrackPress }) => {
  const { getMostPlayed } = usePlayerStore();

  const mostPlayed = useMemo(() => getMostPlayed(5), [getMostPlayed]);

  if (mostPlayed.length === 0) {
    return null;
  }

  const renderItem: ListRenderItem<MostPlayedItem> = ({ item, index }) => (
    <Pressable
      style={styles.item}
      onPress={() => onTrackPress?.(item.track)}
    >
      <View style={styles.rank}>
        <Text style={styles.rankNumber}>#{index + 1}</Text>
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.track.title}
        </Text>
        <Text style={styles.plays}>{item.playCount} plays</Text>
      </View>

      <Feather name="play-circle" size={24} color="#FF6B6B" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔥 Most Played</Text>

      <FlatList
        data={mostPlayed}
        renderItem={renderItem}
        keyExtractor={(item) => item.track.uri}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginHorizontal: 16,
    color: '#000',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  trackInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  plays: {
    fontSize: 12,
    color: '#999',
  },
});
