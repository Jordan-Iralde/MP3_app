import * as MediaLibrary from 'expo-media-library';
import { Track } from '@/types/Track';

/**
 * Service for interacting with the device's media library.
 * Handles querying and mapping audio files to Track objects.
 */

/**
 * Fetches all audio files from the device's media library.
 * 
 * @returns Promise resolving to an array of Track objects
 * @throws Error if permissions are not granted or query fails
 */
export async function fetchAudioTracks(): Promise<Track[]> {
  try {
    // Verify permission
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    // Query audio assets only
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000, // Reasonable limit for initial load
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    // Map to Track objects
    return media.assets.map(mapAssetToTrack);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch audio tracks');
  }
}

/**
 * Maps a MediaLibrary Asset to a Track object.
 * Provides sensible defaults for missing metadata.
 */
function mapAssetToTrack(asset: MediaLibrary.Asset): Track {
  return {
    id: asset.id,
    title: asset.filename.replace(/\.[^/.]+$/, '') || 'Unknown Track', // Remove extension
    artist: 'Unknown Artist', // expo-media-library doesn't provide artist metadata
    duration: asset.duration,
    uri: asset.uri,
  };
}
