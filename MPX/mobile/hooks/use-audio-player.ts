/**
 * FUTURE: Hook skeleton for audio player
 * Shows how to integrate playback with component state
 */

import { useEffect, useState } from 'react';
import { Song } from '@/domain/models/Song';
import { PlaybackState } from '@/domain/models/Player';
import { audioPlayerService } from '@/services/audioPlayer.service';

export interface UseAudioPlayerState {
  currentSong: Song | null;
  playbackState: PlaybackState;
  isLoading: boolean;
  error: Error | null;
  play: (song: Song) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
}

/**
 * FUTURE: Hook to manage audio playback
 * Ready to implement when adding playback features
 */
export function useAudioPlayer(): UseAudioPlayerState {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    audioPlayerService.getState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const play = async (song: Song) => {
    try {
      setIsLoading(true);
      setError(null);
      await audioPlayerService.play(song);
      setCurrentSong(song);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Playback failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const pause = async () => {
    try {
      await audioPlayerService.pause();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Pause failed'));
    }
  };

  const resume = async () => {
    try {
      await audioPlayerService.resume();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Resume failed'));
    }
  };

  const seek = async (seconds: number) => {
    try {
      await audioPlayerService.seek(seconds);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Seek failed'));
    }
  };

  return {
    currentSong,
    playbackState,
    isLoading,
    error,
    play,
    pause,
    resume,
    seek,
  };
}
