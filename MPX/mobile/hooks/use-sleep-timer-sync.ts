import { useEffect } from 'react';
import { sleepTimerService } from '@/services/sleep-timer.service';
import { usePlayer } from '@/context/PlayerContext';

/**
 * Hook to sync sleep timer with player
 * When sleep timer expires, pauses the player
 * 
 * IMPORTANT: Must be used INSIDE PlayerProvider, not at root level
 */
export function useSleepTimerSync() {
  const playerContext = usePlayer();
  
  if (!playerContext) {
    // If outside PlayerProvider, just return
    return;
  }

  const { playerState, pause } = playerContext;

  useEffect(() => {
    const unsubscribe = sleepTimerService.subscribe((state) => {
      if (state.isActive && state.remainingMs <= 0 && playerState.isPlaying) {
        // Timer expired, pause playback
        pause().catch((error) => {
          console.error('[useSleepTimerSync] Error pausing playback:', error);
        });
      }
    });

    return unsubscribe;
  }, [playerState.isPlaying, pause]);
}
