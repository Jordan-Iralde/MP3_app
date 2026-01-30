import { useEffect, useState } from 'react';
import { Song } from '@/domain/models/Song';
import { musicLibraryService } from '@/services/musicLibrary.service';

export interface UseLocalMusicLibraryState {
  songs: Song[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage local music library state.
 * Abstracts away service layer details from components.
 *
 * @param permissionGranted - True when user has granted storage permission
 * @returns State object with songs, loading, error, and refetch function
 */
export function useLocalMusicLibrary(permissionGranted: boolean): UseLocalMusicLibraryState {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadLibrary = async () => {
    if (!permissionGranted) {
      setSongs([]);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedSongs = await musicLibraryService.fetchAudioFiles();
      setSongs(fetchedSongs);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load library');
      setError(errorObj);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load when permission granted
  useEffect(() => {
    loadLibrary();
  }, [permissionGranted]);

  return {
    songs,
    isLoading,
    error,
    refetch: loadLibrary,
  };
}
