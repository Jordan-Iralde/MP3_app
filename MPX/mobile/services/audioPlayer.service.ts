import { Platform } from 'react-native';
import { Track } from '../types/Track';

// Only import expo-av on native platforms
let Audio: any = null;
if (Platform.OS !== 'web') {
  try {
    const audioModule = require('expo-av');
    Audio = audioModule.Audio;
  } catch (error) {
    console.warn('expo-av not available:', error);
  }
}

export interface AudioPlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  isLoading: boolean;
  error: string | null;
}

export type AudioPlaybackListener = (state: AudioPlaybackState) => void;

export class AudioPlayerService {
  private static instance: AudioPlayerService;
  private sound: any = null;
  private state: AudioPlaybackState = {
    currentTrack: null,
    isPlaying: false,
    duration: 0,
    position: 0,
    isLoading: false,
    error: null,
  };
  private listeners: Set<AudioPlaybackListener> = new Set();

  private constructor() {}

  static getInstance(): AudioPlayerService {
    if (!AudioPlayerService.instance) {
      AudioPlayerService.instance = new AudioPlayerService();
    }
    return AudioPlayerService.instance;
  }

  subscribe(listener: AudioPlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  async loadTrack(track: Track): Promise<void> {
    try {
      if (!Audio) {
        throw new Error('Audio module not available on this platform');
      }

      this.state = {
        ...this.state,
        isLoading: true,
        error: null,
      };
      this.notifyListeners();

      // Unload previous sound if it exists
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Create and load new sound
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: track.uri });

      // Set up status update callback
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          this.state = {
            ...this.state,
            duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            position: status.positionMillis ? status.positionMillis / 1000 : 0,
            isPlaying: status.isPlaying,
          };
        }
        this.notifyListeners();
      });

      this.sound = sound;
      this.state = {
        ...this.state,
        currentTrack: track,
        isLoading: false,
        isPlaying: false,
        duration: 0,
        position: 0,
      };
      this.notifyListeners();
    } catch (error) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load track',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound) {
      throw new Error('No track loaded');
    }
    try {
      await this.sound.playAsync();
    } catch (error) {
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to play track',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) {
      throw new Error('No track loaded');
    }
    try {
      await this.sound.pauseAsync();
    } catch (error) {
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to pause track',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async seek(position: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No track loaded');
    }
    try {
      await this.sound.setPositionAsync(position * 1000); // Convert seconds to ms
    } catch (error) {
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to seek',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async unload(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.warn('Error unloading sound:', error);
      }
      this.sound = null;
    }
    this.state = {
      currentTrack: null,
      isPlaying: false,
      duration: 0,
      position: 0,
      isLoading: false,
      error: null,
    };
    this.notifyListeners();
  }

  getState(): AudioPlaybackState {
    return { ...this.state };
  }
}

export const audioPlayerService = AudioPlayerService.getInstance();
