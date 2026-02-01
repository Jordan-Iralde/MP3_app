import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayer } from '@/context/PlayerContext';
import { queueService } from '@/services/queue.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DraggableTrackList } from '@/components/draggable-track-list';
import { QueueViewer } from '@/components/queue-viewer';

interface QueueScreenProps {
  onClose?: () => void;
}

export function QueueScreen({ onClose }: QueueScreenProps) {
  const { queue, currentIndex, setQueue } = usePlayer();
  const [localQueue, setLocalQueue] = useState(queue);

  useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    try {
      const newQueue = [...localQueue];
      const [movedTrack] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedTrack);
      
      setLocalQueue(newQueue);
      setQueue(newQueue);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reordenar la cola');
      console.error(error);
    }
  };

  const handleRemove = (index: number) => {
    try {
      const newQueue = localQueue.filter((_, i) => i !== index);
      setLocalQueue(newQueue);
      setQueue(newQueue);
    } catch (error) {
      Alert.alert('Error', 'No se pudo remover la canción');
      console.error(error);
    }
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Limpiar cola',
      '¿Estás seguro que deseas limpiar toda la cola?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Limpiar',
          onPress: () => {
            setLocalQueue([]);
            setQueue([]);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <ThemedText style={styles.title}>Cola de reproducción</ThemedText>
          <ThemedText style={styles.trackCount}>
            {localQueue.length} canción{localQueue.length !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#007AFF" />
          </Pressable>
        )}
      </View>

      {/* Queue content */}
      {localQueue.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="playlist-remove"
            size={48}
            color="#CCC"
            style={styles.emptyIcon}
          />
          <ThemedText style={styles.emptyText}>
            La cola está vacía
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.content}>
          <DraggableTrackList
            tracks={localQueue}
            onReorder={handleReorder}
            onRemove={handleRemove}
            canDrag={localQueue.length > 1}
          />
          <Pressable
            style={styles.clearButton}
            onPress={handleClearQueue}
          >
            <MaterialCommunityIcons name="trash-can" size={20} color="#FF6B6B" />
            <ThemedText style={styles.clearButtonText}>Limpiar cola</ThemedText>
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
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  trackCount: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 3,
    color: '#AAA',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    flex: 1,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B20',
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 14,
  },
});
