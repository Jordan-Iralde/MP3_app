/**
 * FUTURE: Hook skeleton for user library management
 * Shows how to integrate favorites and preferences with component state
 */

import { useEffect, useState } from 'react';
import { userLibraryService } from '@/services/userLibrary.service';

export interface UseUserLibraryState {
  favorites: string[]; // Song IDs
  history: string[];
  isLoading: boolean;
  toggleFavorite: (songId: string) => Promise<void>;
  isFavorite: (songId: string) => Promise<boolean>;
}

/**
 * FUTURE: Hook to manage user library (favorites, history, preferences)
 * Ready to implement when adding user preferences
 */
export function useUserLibrary(): UseUserLibraryState {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserLibrary = async () => {
      try {
        setIsLoading(true);
        const favs = await userLibraryService.getFavorites();
        const hist = await userLibraryService.getHistory();
        setFavorites(favs);
        setHistory(hist);
      } catch (err) {
        console.error('Failed to load user library:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserLibrary();
  }, []);

  const toggleFavorite = async (songId: string) => {
    try {
      const isFav = await userLibraryService.isFavorite(songId);
      if (isFav) {
        setFavorites(favorites.filter((id) => id !== songId));
      } else {
        setFavorites([...favorites, songId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isFavorite = async (songId: string) => {
    return userLibraryService.isFavorite(songId);
  };

  return {
    favorites,
    history,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
}
