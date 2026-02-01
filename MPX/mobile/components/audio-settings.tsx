import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AudioSettingsProps {
  onPlaybackSpeedChange?: (speed: number) => void;
  onVolumeChange?: (volume: number) => void;
  currentSpeed?: number;
  currentVolume?: number;
}

export function AudioSettings({
  onPlaybackSpeedChange,
  onVolumeChange,
  currentSpeed = 1.0,
  currentVolume = 1.0,
}: AudioSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [speed, setSpeed] = useState(currentSpeed);
  const [volume, setVolume] = useState(currentVolume);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    onPlaybackSpeedChange?.(newSpeed);
  };

  const handleVolumeChange = (newVolume: number) => {
    const clipped = Math.max(0, Math.min(1, newVolume));
    setVolume(clipped);
    onVolumeChange?.(clipped);
  };

  return (
    <>
      <Pressable
        style={styles.button}
        onPress={() => setIsOpen(true)}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        <MaterialCommunityIcons name="equalizer" size={24} color="#007AFF" />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Audio Settings</ThemedText>
            <Pressable
              onPress={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color="#007AFF"
              />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Playback Speed Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Playback Speed
              </ThemedText>
              <ThemedText style={styles.sectionDescription}>
                Current: {speed.toFixed(2)}x
              </ThemedText>

              <View style={styles.speedGrid}>
                {speeds.map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.speedButton,
                      speed === s && styles.speedButtonActive,
                    ]}
                    onPress={() => handleSpeedChange(s)}
                  >
                    <ThemedText
                      style={[
                        styles.speedButtonText,
                        speed === s && styles.speedButtonTextActive,
                      ]}
                    >
                      {s.toFixed(2)}x
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Volume Control Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Volume</ThemedText>
              <ThemedText style={styles.sectionDescription}>
                {Math.round(volume * 100)}%
              </ThemedText>

              <View style={styles.volumeControl}>
                <MaterialCommunityIcons
                  name="volume-mute"
                  size={20}
                  color="#999"
                />

                <View style={styles.volumeBar}>
                  <View
                    style={[
                      styles.volumeFill,
                      { width: `${volume * 100}%` },
                    ]}
                  />
                </View>

                <MaterialCommunityIcons
                  name="volume-high"
                  size={20}
                  color="#999"
                />
              </View>

              <View style={styles.presetButtons}>
                <Pressable
                  style={styles.presetButton}
                  onPress={() => handleVolumeChange(0.3)}
                >
                  <ThemedText style={styles.presetButtonText}>
                    Quiet
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={styles.presetButton}
                  onPress={() => handleVolumeChange(0.6)}
                >
                  <ThemedText style={styles.presetButtonText}>
                    Medium
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={styles.presetButton}
                  onPress={() => handleVolumeChange(1.0)}
                >
                  <ThemedText style={styles.presetButtonText}>
                    Loud
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Tips</ThemedText>
              <ThemedText style={styles.tipText}>
                • Use lower speeds for detailed listening
              </ThemedText>
              <ThemedText style={styles.tipText}>
                • Higher speeds are great for skimming
              </ThemedText>
              <ThemedText style={styles.tipText}>
                • Adjust volume based on your environment
              </ThemedText>
            </View>
          </ScrollView>

          {/* Close Button */}
          <Pressable
            style={styles.doneButton}
            onPress={() => setIsOpen(false)}
          >
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 0.31,
  },
  speedButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  speedButtonTextActive: {
    color: '#FFF',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipText: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
    marginLeft: 8,
  },
  doneButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
