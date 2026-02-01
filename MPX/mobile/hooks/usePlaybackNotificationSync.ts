import { useEffect } from 'react';
import { useContext } from 'react';
import { PlayerContext } from '@/context/PlayerContext';
import { audioPlayerService } from '@/services/audioPlayer.service';
import { playbackNotificationManager } from '@/services/playback-notification-manager';

/**
 * Hook para sincronizar eventos de notificación con el reproductor de audio
 */
export const usePlaybackNotificationSync = () => {
  const playerContext = useContext(PlayerContext);

  useEffect(() => {
    if (!playerContext) {
      console.warn('[usePlaybackNotificationSync] PlayerContext not available');
      return;
    }

    // Suscribirse a eventos de play/pause desde la notificación
    const unsubPlayPause = playbackNotificationManager.onPlayPausePressed(
      async (isPlaying) => {
        try {
          if (isPlaying) {
            console.log('[usePlaybackNotificationSync] Play from notification');
            await audioPlayerService.play();
          } else {
            console.log('[usePlaybackNotificationSync] Pause from notification');
            await audioPlayerService.pause();
          }
        } catch (error) {
          console.error('[usePlaybackNotificationSync] Error handling play/pause:', error);
        }
      }
    );

    // Suscribirse a evento de siguiente
    const unsubNext = playbackNotificationManager.onNextPressed(async () => {
      try {
        console.log('[usePlaybackNotificationSync] Next from notification');
        await playerContext.next();
      } catch (error) {
        console.error('[usePlaybackNotificationSync] Error handling next:', error);
      }
    });

    // Suscribirse a evento de anterior
    const unsubPrevious = playbackNotificationManager.onPreviousPressed(async () => {
      try {
        console.log('[usePlaybackNotificationSync] Previous from notification');
        await playerContext.previous();
      } catch (error) {
        console.error('[usePlaybackNotificationSync] Error handling previous:', error);
      }
    });

    // Suscribirse a evento de cerrar
    const unsubDismiss = playbackNotificationManager.onDismissPressed(async () => {
      try {
        console.log('[usePlaybackNotificationSync] Dismiss from notification');
        await audioPlayerService.pause();
        await audioPlayerService.unload();
      } catch (error) {
        console.error('[usePlaybackNotificationSync] Error handling dismiss:', error);
      }
    });

    return () => {
      unsubPlayPause();
      unsubNext();
      unsubPrevious();
      unsubDismiss();
    };
  }, [playerContext]);
};
