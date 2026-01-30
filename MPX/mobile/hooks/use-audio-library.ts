import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Track } from '@/types/Track';

export interface AudioLibraryState {
  tracks: Track[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch audio files from the device's media library.
 * Automatically scans when permissions are granted.
 * 
 * Returns:
 * - tracks: Array of Track objects sorted by modification date (newest first)
 * - isLoading: True while scanning
 * - error: Any error that occurred during scanning
 * - refetch: Function to manually trigger a rescan
 */
export function useAudioLibrary(permissionGranted: boolean): AudioLibraryState {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAudioFiles = async () => {
    if (!permissionGranted) {
      setTracks([]);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Query audio assets from media library
      // MediaType.audio filters for audio files only
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        sortBy: [MediaLibrary.SortBy.modificationTime],
        first: 1000, // Fetch up to 1000 audio files
      });

      // Transform raw media assets into Track objects
      const transformedTracks: Track[] = result.assets.map((asset) => ({
        id: asset.id,
        title: asset.filename.replace(/\.mp3$/i, '') || 'Unknown Title',
        artist: 'Unknown Artist',
        duration: Math.floor(asset.duration || 0),
        uri: asset.uri,
        filename: asset.filename,
        modificationTime: asset.modificationTime,
      }));

      // Sort by modification time (newest first)
      transformedTracks.sort((a, b) => {
        const aTime = a.modificationTime || 0;
        const bTime = b.modificationTime || 0;
        return bTime - aTime;
      });

      setTracks(transformedTracks);
    } catch (err) {
      console.error('Error fetching audio files:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch audio files'));
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scan when permission is granted
  useEffect(() => {
    fetchAudioFiles();
  }, [permissionGranted]);

  return {
    tracks,
    isLoading,
    error,
    refetch: fetchAudioFiles,
  };
}
