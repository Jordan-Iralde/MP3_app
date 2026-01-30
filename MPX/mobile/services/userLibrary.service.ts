/**
 * FUTURE: Service skeleton for managing favorites and user library state
 * Shows how to add favorites and user preferences
 */

import { UserLibraryState } from '@/domain/models/Player';

export class UserLibraryService {
  private libraryState: UserLibraryState = {
    favoriteSongIds: [],
    lastPlayedSongId: null,
    playHistory: [],
  };

  /**
   * Toggle favorite status for a song
   * @param songId - Song ID
   */
  async toggleFavorite(songId: string): Promise<boolean> {
    // TODO: Implement toggle
    throw new Error('Not implemented');
  }

  /**
   * Check if song is favorite
   * @param songId - Song ID
   */
  async isFavorite(songId: string): Promise<boolean> {
    return this.libraryState.favoriteSongIds.includes(songId);
  }

  /**
   * Get all favorite song IDs
   */
  async getFavorites(): Promise<string[]> {
    return this.libraryState.favoriteSongIds;
  }

  /**
   * Update last played song
   * @param songId - Song ID
   */
  async updateLastPlayed(songId: string): Promise<void> {
    // TODO: Implement update
  }

  /**
   * Add to play history
   * @param songId - Song ID
   */
  async addToHistory(songId: string): Promise<void> {
    // TODO: Implement add
  }

  /**
   * Get play history
   */
  async getHistory(): Promise<string[]> {
    return this.libraryState.playHistory;
  }
}

export const userLibraryService = new UserLibraryService();
