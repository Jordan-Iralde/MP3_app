import { Track } from '@/types/Track';
import { Platform } from 'react-native';

/**
 * Servicio de notificaciones como fallback
 * Para Android: usar playback-notification-manager.ts (módulo nativo)
 * Para iOS: Este servicio proporciona fallback
 */

export interface PlaybackNotificationState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Actualizar notificación de reproducción
   */
  async updatePlaybackNotification(state: PlaybackNotificationState): Promise<void> {
    try {
      // Android utiliza el módulo nativo PlaybackNotificationModule
      if (Platform.OS === 'android') {
        console.log('[NotificationService] Android using native module, skipping');
        return;
      }

      // iOS: Placeholder para futuras implementaciones con UNNotificationCenter
      if (Platform.OS === 'ios') {
        console.log(
          '[NotificationService.iOS] Playback notification:',
          state.currentTrack?.title,
          state.isPlaying ? 'playing' : 'paused'
        );
        return;
      }

      // Web: No soportado
      console.log('[NotificationService] Notifications not supported on web');
    } catch (error) {
      console.error('[NotificationService] Error updating notification:', error);
    }
  }

  /**
   * Cancelar notificación
   */
  async dismissNotification(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        console.log('[NotificationService.iOS] Notification dismissed');
        return;
      }

      if (Platform.OS === 'android') {
        return; // Manejado por módulo nativo
      }
    } catch (error) {
      console.error('[NotificationService] Error dismissing notification:', error);
    }
  }

  /**
   * Limpiar
   */
  async cleanup(): Promise<void> {
    try {
      await this.dismissNotification();
    } catch (error) {
      console.error('[NotificationService] Error during cleanup:', error);
    }
  }
}
