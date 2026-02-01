import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { sleepTimerService, SleepTimerState, SleepTimerDuration } from '@/services/sleep-timer.service';
import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

const DURATIONS: SleepTimerDuration[] = [5, 10, 15, 30, 60];

export function SleepTimerButton() {
  const [timerState, setTimerState] = useState<SleepTimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    duration: null,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = sleepTimerService.subscribe(setTimerState);
    return unsubscribe;
  }, []);

  const handleStartTimer = (minutes: SleepTimerDuration) => {
    sleepTimerService.start(minutes, () => {
      Alert.alert('Sleep Timer', 'Sleep timer expired. Pausing playback.');
    });
    setShowModal(false);
  };

  const handleStopTimer = () => {
    sleepTimerService.stop();
  };

  const handlePauseTimer = () => {
    sleepTimerService.pause();
  };

  const handleResumeTimer = () => {
    sleepTimerService.resume();
  };

  if (timerState.isActive) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: '#00D4FF15',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#00D4FF30',
          }}
        >
          <Feather name="clock" size={16} color="#00D4FF" />
          <ThemedText style={{ fontSize: 12, fontWeight: '700', color: '#00D4FF' }}>
            {sleepTimerService.getFormattedTime()}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            onPress={timerState.isActive ? handlePauseTimer : handleResumeTimer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={timerState.isActive ? 'pause' : 'play'}
              size={18}
              color="#00D4FF"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStopTimer} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="clock" size={20} color="#00D4FF" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <ThemedView
            style={{
              borderRadius: 14,
              padding: 24,
              width: '100%',
              maxWidth: 340,
              backgroundColor: '#0a0a0a',
              borderWidth: 1,
              borderColor: '#1a1a1a',
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 24, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#FFF' }}>
              Sleep Timer
            </ThemedText>

            <View style={{ gap: 10, marginBottom: 20 }}>
              {DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  onPress={() => handleStartTimer(duration)}
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    backgroundColor: '#00D4FF15',
                    borderRadius: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#00D4FF30',
                  }}
                >
                  <ThemedText style={{ fontWeight: '700', color: '#FFF' }}>{duration} min</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: '#888', opacity: 0.8, fontWeight: '600' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

export function SleepTimerProgress() {
  const [timerState, setTimerState] = useState<SleepTimerState>({
    isActive: false,
    remainingSeconds: 0,
    totalSeconds: 0,
    duration: null,
  });

  useEffect(() => {
    const unsubscribe = sleepTimerService.subscribe(setTimerState);
    return unsubscribe;
  }, []);

  if (!timerState.isActive) {
    return null;
  }

  const progress = sleepTimerService.getProgress();

  return (
    <View
      style={{
        height: 3,
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#00D4FF',
        }}
      />
    </View>
  );
}
