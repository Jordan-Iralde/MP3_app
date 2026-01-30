import { Song } from '@/domain/models/Song';

/**
 * FUTURE: Represents the audio player state
 * Ready for implementation when adding playback
 */
export interface PlaybackState {
  currentSongId: string | null;
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number;
}

/**
 * FUTURE: Represents user library state (favorites, history, etc.)
 */
export interface UserLibraryState {
  favoriteSongIds: string[];
  lastPlayedSongId: string | null;
  playHistory: string[]; // Array of Song IDs
}
