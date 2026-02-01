import React, { createContext, useCallback, useState, useEffect } from 'react';
import { Track } from '@/types/Track';
import { audioPlayerService, AudioPlaybackState } from '@/services/audioPlayer.service';

export type RepeatMode = 'OFF' | 'ONE' | 'ALL';

export interface PlayerContextType {
  // Playback state
  playerState: AudioPlaybackState;

  // Queue management
  queue: Track[];
  currentIndex: number;

  // Control methods
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (position: number) => Promise<void>;

  // Shuffle and repeat
  shuffle: boolean;
  setShuffle: (enabled: boolean) => void;
  repeatMode: RepeatMode;
  setRepeatMode: (mode: RepeatMode) => void;

  // Queue utilities
  setQueue: (tracks: Track[]) => void;
  clearQueue: () => void;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: React.ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [playerState, setPlayerState] = useState<AudioPlaybackState>(
    audioPlayerService.getState()
  );
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);

  // Subscribe to player state updates
  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribe((state) => {
      setPlayerState(state);
    });
    return unsubscribe;
  }, []);

  // Subscribe to track end events for auto-play
  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribeToTrackEnd(async () => {
      try {
        const nextIndex = currentIndex + 1;
        
        if (repeatMode === 'ONE' && playerState.currentTrack) {
          // Repeat current track
          await audioPlayerService.seek(0);
          await audioPlayerService.play();
          return;
        }

        if (shuffle) {
          // Handle shuffle mode
          const shuffleIndex = shuffleOrder.indexOf(currentIndex);
          if (shuffleIndex < shuffleOrder.length - 1) {
            const nextTrackIndex = shuffleOrder[shuffleIndex + 1];
            if (nextTrackIndex < queue.length) {
              setCurrentIndex(nextTrackIndex);
              const nextTrack = queue[nextTrackIndex];
              await audioPlayerService.loadTrack(nextTrack);
              await audioPlayerService.play();
            }
          } else if (repeatMode === 'ALL' && shuffleOrder.length > 0) {
            // Loop back to beginning in shuffle
            const firstTrackIndex = shuffleOrder[0];
            setCurrentIndex(firstTrackIndex);
            const firstTrack = queue[firstTrackIndex];
            await audioPlayerService.loadTrack(firstTrack);
            await audioPlayerService.play();
          }
        } else {
          // Normal mode
          if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            const nextTrack = queue[nextIndex];
            await audioPlayerService.loadTrack(nextTrack);
            await audioPlayerService.play();
          } else if (repeatMode === 'ALL' && queue.length > 0) {
            // Loop back to beginning
            setCurrentIndex(0);
            const firstTrack = queue[0];
            await audioPlayerService.loadTrack(firstTrack);
            await audioPlayerService.play();
          }
        }
      } catch (error) {
        console.warn('Error in auto-play:', error);
      }
    });
    return unsubscribe;
  }, [currentIndex, queue, repeatMode, shuffle, shuffleOrder, playerState.currentTrack]);

  // Generate shuffle order when shuffle is toggled
  useEffect(() => {
    if (shuffle && queue.length > 0) {
      const order = Array.from({ length: queue.length }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      setShuffleOrder(order);
    }
  }, [shuffle, queue.length]);

  const playTrack = useCallback(
    async (track: Track, newQueue: Track[] = []) => {
      try {
        // If new queue is provided, use it
        if (newQueue.length > 0) {
          setQueue(newQueue);
          const index = newQueue.findIndex((t) => t.id === track.id);
          setCurrentIndex(Math.max(0, index));
        } else if (queue.length === 0) {
          // If no queue, create one with just this track
          setQueue([track]);
          setCurrentIndex(0);
        } else {
          // Find track in current queue
          const index = queue.findIndex((t) => t.id === track.id);
          setCurrentIndex(Math.max(0, index));
        }

        // Load and play the track
        await audioPlayerService.loadTrack(track);
        await audioPlayerService.play();
      } catch (error) {
        console.warn('Error playing track:', error);
      }
    },
    [queue]
  );

  const play = useCallback(async () => {
    try {
      await audioPlayerService.play();
    } catch (error) {
      console.warn('Error resuming playback:', error);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await audioPlayerService.pause();
    } catch (error) {
      console.warn('Error pausing playback:', error);
    }
  }, []);

  const getNextIndex = useCallback(() => {
    if (queue.length === 0) return -1;

    let nextIndex = currentIndex + 1;

    if (shuffle) {
      // In shuffle mode, follow the shuffled order
      const shuffleIndex = shuffleOrder.indexOf(currentIndex);
      if (shuffleIndex < shuffleOrder.length - 1) {
        nextIndex = shuffleOrder[shuffleIndex + 1];
      } else {
        // Reached end of shuffled queue
        if (repeatMode === 'ALL') {
          nextIndex = shuffleOrder[0];
        } else {
          return -1; // Stop
        }
      }
    } else {
      // Normal order
      if (nextIndex >= queue.length) {
        if (repeatMode === 'ALL') {
          nextIndex = 0;
        } else {
          return -1; // Stop
        }
      }
    }

    return nextIndex;
  }, [currentIndex, queue.length, shuffle, shuffleOrder, repeatMode]);

  const next = useCallback(async () => {
    try {
      if (queue.length === 0) return;

      // Handle repeat one
      if (repeatMode === 'ONE' && playerState.currentTrack) {
        await audioPlayerService.seek(0);
        await audioPlayerService.play();
        return;
      }

      const nextIndex = getNextIndex();
      if (nextIndex === -1) {
        // End of queue, stop playback
        await audioPlayerService.pause();
        return;
      }

      setCurrentIndex(nextIndex);
      const nextTrack = queue[nextIndex];
      await audioPlayerService.loadTrack(nextTrack);
      await audioPlayerService.play();
    } catch (error) {
      console.warn('Error playing next track:', error);
    }
  }, [queue, repeatMode, playerState.currentTrack, getNextIndex]);

  const previous = useCallback(async () => {
    try {
      if (queue.length === 0) return;

      // If more than 3 seconds have played, restart current track
      if (playerState.position > 3) {
        await audioPlayerService.seek(0);
        await audioPlayerService.play();
        return;
      }

      // Otherwise, go to previous track
      let prevIndex = currentIndex - 1;

      if (shuffle) {
        const shuffleIndex = shuffleOrder.indexOf(currentIndex);
        if (shuffleIndex > 0) {
          prevIndex = shuffleOrder[shuffleIndex - 1];
        } else {
          return; // No previous track in shuffle
        }
      } else {
        if (prevIndex < 0) {
          return; // No previous track
        }
      }

      setCurrentIndex(prevIndex);
      const prevTrack = queue[prevIndex];
      await audioPlayerService.loadTrack(prevTrack);
      await audioPlayerService.play();
    } catch (error) {
      console.warn('Error playing previous track:', error);
    }
  }, [queue, currentIndex, playerState.position, shuffle, shuffleOrder]);

  const seek = useCallback(async (position: number) => {
    try {
      await audioPlayerService.seek(position);
    } catch (error) {
      console.warn('Error seeking:', error);
    }
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setShuffleOrder([]);
  }, []);

  const handleSetQueue = useCallback((tracks: Track[]) => {
    setQueue(tracks);
    setCurrentIndex(-1);
    setShuffleOrder([]);
  }, []);

  const value: PlayerContextType = {
    playerState,
    queue,
    currentIndex,
    playTrack,
    play,
    pause,
    next,
    previous,
    seek,
    shuffle,
    setShuffle,
    repeatMode,
    setRepeatMode,
    setQueue: handleSetQueue,
    clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextType {
  const context = React.useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
