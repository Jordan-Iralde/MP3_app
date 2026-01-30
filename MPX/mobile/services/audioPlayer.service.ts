/**
 * FUTURE: Service skeleton for audio playback
 * Shows how to extend the architecture for playback features
 */

import { Song } from '@/domain/models/Song';
import { PlaybackState } from '@/domain/models/Player';

export class AudioPlayerService {
  private playbackState: PlaybackState = {
    currentSongId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  };

  /**
   * Initialize player with a song
   * @param song - Song to play
   */
  async play(song: Song): Promise<void> {
    // TODO: Use expo-av Audio module
    // const { sound } = await Audio.Sound.createAsync({ uri: song.uri });
    // await sound.playAsync();
  }

  /**
   * Pause current playback
   */
  async pause(): Promise<void> {
    // TODO: Implement pause
  }

  /**
   * Resume playback
   */
  async resume(): Promise<void> {
    // TODO: Implement resume
  }

  /**
   * Seek to specific time
   * @param seconds - Target time in seconds
   */
  async seek(seconds: number): Promise<void> {
    // TODO: Implement seek
  }

  /**
   * Get current playback state
   */
  getState(): PlaybackState {
    return this.playbackState;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // TODO: Release audio resources
  }
}

export const audioPlayerService = new AudioPlayerService();
