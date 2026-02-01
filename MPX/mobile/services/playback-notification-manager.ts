import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Track } from '@/types/Track';

interface PlaybackNotificationData {
  trackUri: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  isPlaying: boolean;
}

interface PlaybackControlCallback {
  onPlayPause: (isPlaying: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onDismiss?: () => void;
}

class PlaybackNotificationManager {
  private static instance: PlaybackNotificationManager;
  private eventEmitter: NativeEventEmitter | null = null;
  private subscriptions: Map<string, Function> = new Map();
  private currentNotificationId: number | null = null;

  private constructor() {
    if (Platform.OS === 'android') {
      this.initializeAndroid();
    }
  }

  static getInstance(): PlaybackNotificationManager {
    if (!PlaybackNotificationManager.instance) {
      PlaybackNotificationManager.instance = new PlaybackNotificationManager();
    }
    return PlaybackNotificationManager.instance;
  }

  /**
   * Inicializar módulo nativo de Android
   */
  private initializeAndroid(): void {
    try {
      const PlaybackNotificationModule = NativeModules.PlaybackNotificationModule;
      if (PlaybackNotificationModule) {
        this.eventEmitter = new NativeEventEmitter(PlaybackNotificationModule);
        console.log('[PlaybackNotificationManager] Android module initialized');
      } else {
        console.warn('[PlaybackNotificationManager] PlaybackNotificationModule not available');
      }
    } catch (error) {
      console.error('[PlaybackNotificationManager] Error initializing Android module:', error);
    }
  }

  /**
   * Mostrar notificación de reproducción
   */
  async showPlaybackNotification(
    track: Track,
    isPlaying: boolean,
    currentTime: number = 0,
    duration: number = 0
  ): Promise<number | null> {
    try {
      if (Platform.OS !== 'android') {
        return null;
      }

      const PlaybackNotificationModule = NativeModules.PlaybackNotificationModule;
      if (!PlaybackNotificationModule) {
        console.warn('[PlaybackNotificationManager] Module not available');
        return null;
      }

      const notificationId = await PlaybackNotificationModule.showPlaybackNotification(
        {
          trackUri: track.uri,
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artist,
          isPlaying,
          currentTime,
          duration,
        } as PlaybackNotificationData
      );

      this.currentNotificationId = notificationId;
      console.log('[PlaybackNotificationManager] Notification shown:', track.title);

      return notificationId;
    } catch (error) {
      console.error('[PlaybackNotificationManager] Error showing notification:', error);
      return null;
    }
  }

  /**
   * Actualizar estado de la notificación
   */
  async updatePlaybackNotification(
    isPlaying: boolean,
    currentTime: number = 0
  ): Promise<void> {
    try {
      if (Platform.OS !== 'android' || !this.currentNotificationId) {
        return;
      }

      const PlaybackNotificationModule = NativeModules.PlaybackNotificationModule;
      if (!PlaybackNotificationModule) {
        return;
      }

      await PlaybackNotificationModule.updatePlaybackNotification({
        notificationId: this.currentNotificationId,
        isPlaying,
        currentTime,
      });

      console.log('[PlaybackNotificationManager] Notification updated');
    } catch (error) {
      console.error('[PlaybackNotificationManager] Error updating notification:', error);
    }
  }

  /**
   * Cancelar notificación
   */
  async dismissNotification(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        return;
      }

      const PlaybackNotificationModule = NativeModules.PlaybackNotificationModule;
      if (PlaybackNotificationModule && this.currentNotificationId) {
        await PlaybackNotificationModule.dismissNotification(this.currentNotificationId);
        this.currentNotificationId = null;
        console.log('[PlaybackNotificationManager] Notification dismissed');
      }
    } catch (error) {
      console.error('[PlaybackNotificationManager] Error dismissing notification:', error);
    }
  }

  /**
   * Suscribirse a eventos de la notificación
   */
  onPlayPausePressed(callback: (isPlaying: boolean) => void): () => void {
    if (!this.eventEmitter) {
      return () => {};
    }

    const subscription = this.eventEmitter.addListener('playback_play_pause', (data) => {
      try {
        callback(data.isPlaying);
      } catch (error) {
        console.error('[PlaybackNotificationManager] Error in play/pause callback:', error);
      }
    });

    return () => subscription.remove();
  }

  /**
   * Suscribirse a evento de cerrar
   */
  onDismissPressed(callback: () => void): () => void {
    if (!this.eventEmitter) {
      return () => {};
    }

    const subscription = this.eventEmitter.addListener('playback_dismiss', () => {
      try {
        callback();
      } catch (error) {
        console.error('[PlaybackNotificationManager] Error in dismiss callback:', error);
      }
    });

    return () => subscription.remove();
  }

  /**
   * Suscribirse a evento de siguiente
   */
  onNextPressed(callback: () => void): () => void {
    if (!this.eventEmitter) {
      return () => {};
    }

    const subscription = this.eventEmitter.addListener('playback_next', () => {
      try {
        callback();
      } catch (error) {
        console.error('[PlaybackNotificationManager] Error in next callback:', error);
      }
    });

    return () => subscription.remove();
  }

  /**
   * Suscribirse a evento de anterior
   */
  onPreviousPressed(callback: () => void): () => void {
    if (!this.eventEmitter) {
      return () => {};
    }

    const subscription = this.eventEmitter.addListener('playback_previous', () => {
      try {
        callback();
      } catch (error) {
        console.error('[PlaybackNotificationManager] Error in previous callback:', error);
      }
    });

    return () => subscription.remove();
  }

  /**
   * Limpiar listeners
   */
  cleanup(): void {
    try {
      this.subscriptions.forEach((unsub) => {
        if (typeof unsub === 'function') {
          unsub();
        }
      });
      this.subscriptions.clear();
    } catch (error) {
      console.error('[PlaybackNotificationManager] Error during cleanup:', error);
    }
  }
}

export const playbackNotificationManager = PlaybackNotificationManager.getInstance();

/**
 * Hook para manejar notificaciones de reproducción
 */
export const usePlaybackNotification = (callbacks: Partial<PlaybackControlCallback>) => {
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    if (callbacks.onPlayPause) {
      unsubscribers.push(playbackNotificationManager.onPlayPausePressed(callbacks.onPlayPause));
    }

    if (callbacks.onNext) {
      unsubscribers.push(playbackNotificationManager.onNextPressed(callbacks.onNext));
    }

    if (callbacks.onPrevious) {
      unsubscribers.push(playbackNotificationManager.onPreviousPressed(callbacks.onPrevious));
    }

    if (callbacks.onDismiss) {
      unsubscribers.push(playbackNotificationManager.onDismissPressed(callbacks.onDismiss));
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [callbacks]);
};
