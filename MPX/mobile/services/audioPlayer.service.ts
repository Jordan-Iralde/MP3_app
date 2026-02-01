import { Platform } from 'react-native';
import { Track } from '../types/Track';
import { playbackNotificationManager } from './playback-notification-manager';

// Import expo-audio on native platforms only
let ExpoAudio: any = null;
let isAudioAvailable = false;

console.log('[AudioPlayer] Initializing on platform:', Platform.OS);

if (Platform.OS !== 'web') {
  try {
    console.log('[AudioPlayer] Attempting to load expo-audio module...');
    ExpoAudio = require('expo-audio');
    console.log('[AudioPlayer] expo-audio loaded successfully');
    console.log('[AudioPlayer] Exported functions:', Object.keys(ExpoAudio));
    isAudioAvailable = true;
    
    // Configure audio mode for background playback
    configureAudioMode();
  } catch (error) {
    console.error('[AudioPlayer] FAILED to load expo-audio:', error);
    isAudioAvailable = false;
  }
} else {
  console.log('[AudioPlayer] Web platform detected, audio disabled');
}

// Configure audio for background playback
async function configureAudioMode() {
  try {
    if (ExpoAudio && ExpoAudio.setAudioModeAsync) {
      await ExpoAudio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        staysActiveInBackground: true,
        interruptionMode: 'mixWithOthers',
      });
      console.log('[AudioPlayer] Audio mode configured for background playback');
    }
  } catch (error) {
    console.warn('[AudioPlayer] Error configuring audio mode:', error);
  }
}

export interface AudioPlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  isLoading: boolean;
  error: string | null;
  isBuffering?: boolean;
}

export type AudioPlaybackListener = (state: AudioPlaybackState) => void;
export type TrackEndListener = (track: Track) => void;

export class AudioPlayerService {
  private static instance: AudioPlayerService;
  private player: any = null;
  private statusSubscription: any = null;
  private trackEndListeners: Set<TrackEndListener> = new Set();
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  
  private state: AudioPlaybackState = {
    currentTrack: null,
    isPlaying: false,
    duration: 0,
    position: 0,
    isLoading: false,
    error: null,
    isBuffering: false,
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

  subscribeToTrackEnd(listener: TrackEndListener): () => void {
    this.trackEndListeners.add(listener);
    return () => this.trackEndListeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private notifyTrackEnd(track: Track): void {
    this.trackEndListeners.forEach((listener) => listener(track));
  }

  private startPositionCheck(): void {
    if (this.updateInterval) clearInterval(this.updateInterval);
    
    this.updateInterval = setInterval(() => {
      if (this.player && this.state.duration > 0) {
        const currentPos = this.player.currentTime || 0;
        const duration = this.player.duration || this.state.duration;
        
        // Check if track has ended (within 0.5 second tolerance)
        if (currentPos >= duration - 0.5 && this.state.isPlaying) {
          console.log('[AudioPlayer] Track ended, notifying listeners');
          this.notifyTrackEnd(this.state.currentTrack!);
        }
      }
    }, 100);
  }

  private stopPositionCheck(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async loadTrack(track: Track): Promise<void> {
    try {
      console.log('[AudioPlayer.loadTrack] Start loading track:', track.title, 'URI:', track.uri);
      console.log('[AudioPlayer.loadTrack] isAudioAvailable:', isAudioAvailable);
      console.log('[AudioPlayer.loadTrack] ExpoAudio object:', ExpoAudio ? 'defined' : 'null');

      if (!isAudioAvailable) {
        console.error('[AudioPlayer.loadTrack] Audio not available - throwing error');
        throw new Error('Audio module not available on this platform');
      }

      if (!ExpoAudio) {
        console.error('[AudioPlayer.loadTrack] ExpoAudio is null despite isAudioAvailable=true');
        throw new Error('ExpoAudio module is null');
      }

      this.state = {
        ...this.state,
        isLoading: true,
        error: null,
      };
      this.notifyListeners();

      // Release previous player if it exists
      if (this.player) {
        console.log('[AudioPlayer.loadTrack] Releasing previous player...');
        if (this.statusSubscription) {
          this.statusSubscription.remove();
          this.statusSubscription = null;
        }
        try {
          await this.player.pause();
        } catch (e) {
          console.warn('[AudioPlayer.loadTrack] Error pausing player:', e);
        }
        this.player = null;
      }

      // Create new player using expo-audio API
      console.log('[AudioPlayer.loadTrack] Creating new audio player with URI:', track.uri);
      const { createAudioPlayer } = ExpoAudio;
      
      if (!createAudioPlayer) {
        console.error('[AudioPlayer.loadTrack] createAudioPlayer function not found in ExpoAudio');
        console.error('[AudioPlayer.loadTrack] Available in ExpoAudio:', Object.keys(ExpoAudio));
        throw new Error('createAudioPlayer not exported from expo-audio');
      }

      this.player = createAudioPlayer({ uri: track.uri });
      console.log('[AudioPlayer.loadTrack] Player created successfully');
      console.log('[AudioPlayer.loadTrack] Player methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.player)));

      // Subscribe to status updates using addListener
      console.log('[AudioPlayer.loadTrack] Subscribing to playback status...');
      this.statusSubscription = this.player.addListener(
        'playbackStatusUpdate',
        (status: any) => {
          console.log('[AudioPlayer.statusUpdate] Status received:', { 
            playing: status.playing || this.player.playing, 
            duration: status.duration || this.player.duration, 
            currentTime: status.currentTime || this.player.currentTime 
          });
          this.state = {
            ...this.state,
            duration: this.player.duration || status.duration || 0,
            position: this.player.currentTime || status.currentTime || 0,
            isPlaying: this.player.playing || status.playing || false,
          };
          this.notifyListeners();
        }
      );

      this.state = {
        ...this.state,
        currentTrack: track,
        isLoading: false,
        isPlaying: false,
        duration: this.player.duration || 0,
        position: this.player.currentTime || 0,
      };
      this.notifyListeners();
      console.log('[AudioPlayer.loadTrack] Track loaded successfully');
    } catch (error) {
      console.error('[AudioPlayer.loadTrack] ERROR:', error);
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
    if (!this.player) {
      throw new Error('No track loaded');
    }
    try {
      console.log('[AudioPlayer.play] Starting playback');
      this.player.play();
      this.startPositionCheck(); // Start checking for track end
      
      // Mostrar notificación de reproducción
      if (this.state.currentTrack) {
        await playbackNotificationManager.showPlaybackNotification(
          this.state.currentTrack,
          true,
          this.state.position,
          this.state.duration
        );
      }
      
      // Actualizar estado local
      this.state = { ...this.state, isPlaying: true };
      this.notifyListeners();
    } catch (error) {
      console.error('[AudioPlayer.play] Error:', error);
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to play track',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.player) {
      throw new Error('No track loaded');
    }
    try {
      console.log('[AudioPlayer.pause] Pausing playback');
      this.player.pause();
      this.stopPositionCheck(); // Stop checking for track end
      
      // Actualizar notificación de reproducción
      if (this.state.currentTrack) {
        await playbackNotificationManager.updatePlaybackNotification(
          false,
          this.state.position
        );
      }
      
      // Actualizar estado local
      this.state = { ...this.state, isPlaying: false };
      this.notifyListeners();
    } catch (error) {
      console.error('[AudioPlayer.pause] Error:', error);
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to pause track',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async seek(position: number): Promise<void> {
    if (!this.player) {
      throw new Error('No track loaded');
    }
    try {
      console.log('[AudioPlayer.seek] Seeking to:', position);
      await this.player.seekTo(position);
      // Actualizar estado local
      this.state = { ...this.state, position };
      this.notifyListeners();
    } catch (error) {
      console.error('[AudioPlayer.seek] Error:', error);
      this.state = {
        ...this.state,
        error: error instanceof Error ? error.message : 'Failed to seek',
      };
      this.notifyListeners();
      throw error;
    }
  }

  async unload(): Promise<void> {
    if (this.player) {
      console.log('[AudioPlayer.unload] Unloading player');
      if (this.statusSubscription) {
        this.statusSubscription.remove();
        this.statusSubscription = null;
      }
      try {
        await this.player.pause();
      } catch (error) {
        console.warn('[AudioPlayer.unload] Error pausing:', error);
      }
      this.player = null;
    }
    
    // Cerrar notificación
    await playbackNotificationManager.dismissNotification();
    
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
