import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { queueService, QueueState } from '@/services/queue.service';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

export function QueueViewer() {
  const [queueState, setQueueState] = useState<QueueState>({ tracks: [], currentIndex: -1 });
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = queueService.subscribe(setQueueState);
    return unsubscribe;
  }, []);

  const handleRemoveTrack = (index: number) => {
    Alert.alert('Remove Track', `Remove "${queueState.tracks[index].title}" from queue?`, [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Remove',
        onPress: async () => {
          try {
            setIsRemoving(queueState.tracks[index].uri);
            queueService.removeTrackAt(index);
          } catch (error) {
            console.error('Error removing track:', error);
            Alert.alert('Error', 'Failed to remove track');
          } finally {
            setIsRemoving(null);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleClearQueue = () => {
    Alert.alert('Clear Queue', 'Remove all tracks from queue?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Clear',
        onPress: () => {
          queueService.clearQueue();
        },
        style: 'destructive',
      },
    ]);
  };

  if (!queueState.tracks.length) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Feather name="music" size={48} color={Colors.light.text} opacity={0.3} />
        <ThemedText style={{ marginTop: 12, opacity: 0.6, textAlign: 'center' }}>
          Queue is empty
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
        <ThemedText type="subtitle">Queue ({queueState.tracks.length})</ThemedText>
        <TouchableOpacity onPress={handleClearQueue} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="trash-2" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {queueState.tracks.map((track, index) => (
          <View
            key={`${track.uri}-${index}`}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
              backgroundColor: index === queueState.currentIndex ? Colors.light.tabIconSelected + '15' : undefined,
              opacity: isRemoving === track.uri ? 0.5 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 30, alignItems: 'center' }}>
                {index === queueState.currentIndex ? (
                  <Feather name="play" size={18} color={Colors.light.tabIconSelected} />
                ) : (
                  <ThemedText style={{ opacity: 0.5 }}>{index + 1}</ThemedText>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText
                  numberOfLines={1}
                  style={{ fontWeight: index === queueState.currentIndex ? '600' : '400' }}
                >
                  {track.title}
                </ThemedText>
                <ThemedText numberOfLines={1} style={{ opacity: 0.6, fontSize: 12 }}>
                  {track.artist}
                </ThemedText>
              </View>

              {isRemoving === track.uri ? (
                <ActivityIndicator />
              ) : (
                <TouchableOpacity
                  onPress={() => handleRemoveTrack(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}
