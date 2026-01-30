import * as MediaLibrary from 'expo-media-library';
import { Song } from '@/domain/models/Song';
import { checkStoragePermission } from '@/utils/permissions';

export class MusicLibraryService {
  /**
   * Fetches audio files from device's media library
   * @returns Array of Song objects sorted by modification date (newest first)
   */
  async fetchAudioFiles(): Promise<Song[]> {
    try {
      // Verify permission before querying
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission not granted');
      }

      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        sortBy: [MediaLibrary.SortBy.modificationTime],
        first: 1000,
      });

      // Transform raw assets to Song domain model
      const songs = result.assets.map(this.assetToSong);

      // Already sorted by modification time from API
      return songs;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Transform raw MediaLibrary asset to Song domain model
   */
  private assetToSong(asset: MediaLibrary.Asset): Song {
    return {
      id: asset.id,
      title: asset.filename.replace(/\.mp3$/i, '') || 'Unknown Title',
      artist: 'Unknown Artist',
      duration: Math.floor(asset.duration / 1000), // Convert ms to seconds
      uri: asset.uri,
    };
  }

  /**
   * Centralized error handling for music library operations
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to fetch audio files');
  }
}

// Singleton instance
export const musicLibraryService = new MusicLibraryService();
