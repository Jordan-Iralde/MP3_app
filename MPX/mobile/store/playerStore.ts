import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { Track } from '@/types/Track';

// Lazy-load AsyncStorage with fallback
let AsyncStorage: any = null;
const getAsyncStorage = async () => {
  if (!AsyncStorage && Platform.OS !== 'web') {
    try {
      AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
    } catch (error) {
      console.warn('[PlayerStore] AsyncStorage not available, using memory storage');
      return null;
    }
  }
  return AsyncStorage;
};

export interface PlayStats {
  [trackUri: string]: {
    playCount: number;
    lastPlayed: number;
  };
}

interface PlayerStore {
  // Current playback state
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: 'OFF' | 'ONE' | 'ALL';
  isShuffle: boolean;
  shuffleOrder: number[];

  // Mini-player visibility
  miniPlayerVisible: boolean;

  // Play statistics
  playStats: PlayStats;

  // Actions
  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'OFF' | 'ONE' | 'ALL') => void;
  setIsShuffle: (shuffle: boolean) => void;
  setShuffleOrder: (order: number[]) => void;
  setMiniPlayerVisible: (visible: boolean) => void;

  // Play stats actions
  recordPlay: (trackUri: string) => void;
  getMostPlayed: (limit?: number) => Array<{ track: Track; playCount: number }>;

  // Utility
  reset: () => void;
}

const initialState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  repeatMode: 'OFF' as const,
  isShuffle: false,
  shuffleOrder: [],
  miniPlayerVisible: false,
  playStats: {},
};

// Memory storage fallback
const memoryStorage = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
  removeItem: async (key: string) => {},
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentTrack: (track) => set({ currentTrack: track }),
      setQueue: (tracks) => set({ queue: tracks }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      setIsShuffle: (shuffle) => set({ isShuffle: shuffle }),
      setShuffleOrder: (order) => set({ shuffleOrder: order }),
      setMiniPlayerVisible: (visible) => set({ miniPlayerVisible: visible }),

      recordPlay: (trackUri: string) => {
        const { playStats } = get();
        const stats = playStats[trackUri] || { playCount: 0, lastPlayed: 0 };
        
        set({
          playStats: {
            ...playStats,
            [trackUri]: {
              playCount: stats.playCount + 1,
              lastPlayed: Date.now(),
            },
          },
        });
      },

      getMostPlayed: (limit = 10) => {
        const { playStats, queue } = get();
        
        const statsArray = Object.entries(playStats)
          .map(([uri, stats]) => {
            const track = queue.find((t) => t.uri === uri);
            return { track, uri, ...stats };
          })
          .filter((item) => item.track)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, limit);

        return statsArray.map((item) => ({
          track: item.track!,
          playCount: item.playCount,
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'player-store',
      storage: createJSONStorage(() => AsyncStorage || memoryStorage),
      partialize: (state) => ({
        playStats: state.playStats,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
      }),
    }
  )
);
