import { useEffect, useState } from 'react';
import { Track } from '@/types/Track';
import { audioPlayerService, AudioPlaybackState } from '@/services/audioPlayer.service';

export interface UseAudioPlayerReturn {
  state: AudioPlaybackState;
  loadTrack: (track: Track) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  unload: () => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlaybackState>(audioPlayerService.getState());

  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    state,
    loadTrack: (track: Track) => audioPlayerService.loadTrack(track),
    play: () => audioPlayerService.play(),
    pause: () => audioPlayerService.pause(),
    seek: (position: number) => audioPlayerService.seek(position),
    unload: () => audioPlayerService.unload(),
  };
}
