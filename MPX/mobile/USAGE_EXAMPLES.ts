/**
 * HOW TO USE THE REFACTORED ARCHITECTURE
 * Practical examples for developers
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 1: Using the Library Screen (Current - v0.2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * app/(tabs)/library.tsx
 */
import { useStoragePermission } from '@/hooks/use-storage-permission';
import { useLocalMusicLibrary } from '@/hooks/use-local-music-library';

export default function LibraryScreen() {
  // Hook 1: Check storage permission
  const { isGranted } = useStoragePermission();

  // Hook 2: Load music library (auto-runs when isGranted = true)
  const { songs, isLoading, error, refetch } = useLocalMusicLibrary(isGranted);

  // Render based on state
  if (!isGranted) return <PermissionScreen />;
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;
  if (songs.length === 0) return <EmptyScreen onRescan={refetch} />;

  // Success: render songs list
  return (
    <FlatList
      data={songs}
      renderItem={({ item }) => (
        <SongListItem song={item} />
      )}
      refreshControl={<RefreshControl onRefresh={refetch} />}
    />
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 2: Adding Playback (v0.3 Future)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Step 1: Implement audioPlayer.service.ts (skeleton exists)
 */

import { Song } from '@/domain/models/Song';
import { Audio } from 'expo-av';

export class AudioPlayerService {
  private sound: Audio.Sound | null = null;

  async play(song: Song): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true }
    );
    this.sound = sound;
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async resume(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }
}

export const audioPlayerService = new AudioPlayerService();

/**
 * Step 2: Implement use-audio-player.ts (skeleton exists)
 */

import { useAudioPlayer } from '@/hooks/use-audio-player';

// In your player screen:
export function PlayerScreen() {
  const { currentSong, play, pause } = useAudioPlayer();

  return (
    <SongInfo song={currentSong} />
    <Button title="Play" onPress={() => play(currentSong)} />
    <Button title="Pause" onPress={pause} />
  );
}

/**
 * Step 3: Integrate with library screen
 */

export function LibraryScreen() {
  const { songs } = useLocalMusicLibrary(isGranted);
  const { play } = useAudioPlayer();

  return (
    <FlatList
      data={songs}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => play(item)}>
          <SongItem song={item} />
        </TouchableOpacity>
      )}
    />
  );
}

/**
 * Benefits:
 * ✓ No changes to useLocalMusicLibrary
 * ✓ No changes to musicLibraryService
 * ✓ Just add new service + hook
 * ✓ Music scanning stays independent from playback
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 3: Adding Favorites (v0.4 Future)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Step 1: Implement userLibrary.service.ts (skeleton exists)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserLibraryService {
  async toggleFavorite(songId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (favorites.includes(songId)) {
      // Remove
      const updated = favorites.filter((id) => id !== songId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    } else {
      // Add
      await AsyncStorage.setItem('favorites', JSON.stringify([...favorites, songId]));
    }
  }

  async getFavorites(): Promise<string[]> {
    const data = await AsyncStorage.getItem('favorites');
    return data ? JSON.parse(data) : [];
  }

  async isFavorite(songId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(songId);
  }
}

export const userLibraryService = new UserLibraryService();

/**
 * Step 2: Use in library screen
 */

export function LibraryScreen() {
  const { songs } = useLocalMusicLibrary(isGranted);
  const { favorites, toggleFavorite } = useUserLibrary();

  return (
    <FlatList
      data={songs}
      renderItem={({ item }) => (
        <SongItem
          song={item}
          isFavorite={favorites.includes(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
    />
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 4: Adding Caching (v0.5 Future)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Step 1: Create cache service
 */

export class SongCache {
  private cache: Map<string, { data: Song[]; timestamp: number }> = new Map();
  private ttl = 5 * 60 * 1000; // 5 minutes

  get(key: string): Song[] | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: Song[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Step 2: Update musicLibrary.service.ts
 */

export class MusicLibraryService {
  private cache = new SongCache();

  async fetchAudioFiles(): Promise<Song[]> {
    // Check cache first
    const cached = this.cache.get('library');
    if (cached) {
      return cached;
    }

    // Fetch from MediaLibrary
    const hasPermission = await checkStoragePermission();
    if (!hasPermission) throw new Error('Permission denied');

    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });

    const songs = result.assets.map(this.assetToSong);

    // Cache result
    this.cache.set('library', songs);

    return songs;
  }
}

/**
 * Benefits:
 * ✓ Faster subsequent loads
 * ✓ No UI changes needed
 * ✓ Transparent to screens
 * ✓ Can add invalidation strategies later
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 5: Testing Services
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Unit test: musicLibrary.service.ts
 */

import { MusicLibraryService } from '@/services/musicLibrary.service';

describe('MusicLibraryService', () => {
  it('transforms Asset to Song correctly', () => {
    const service = new MusicLibraryService();
    const mockAsset = {
      id: '123',
      filename: 'song.mp3',
      duration: 180000, // 3 minutes in ms
      uri: 'content://...',
    };

    const song = service['assetToSong'](mockAsset);

    expect(song.id).toBe('123');
    expect(song.title).toBe('song');
    expect(song.duration).toBe(180); // seconds
  });

  it('handles permission denied', async () => {
    const service = new MusicLibraryService();
    // Mock checkStoragePermission to return false
    jest.mock('@/utils/permissions', () => ({
      checkStoragePermission: jest.fn(() => Promise.resolve(false)),
    }));

    await expect(service.fetchAudioFiles()).rejects.toThrow('Storage permission');
  });
});

/**
 * Hook test: useLocalMusicLibrary
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLocalMusicLibrary } from '@/hooks/use-local-music-library';

describe('useLocalMusicLibrary', () => {
  it('loads songs when permission is granted', async () => {
    const { result } = renderHook(() => useLocalMusicLibrary(true));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      // Wait for hook to load
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.songs.length).toBeGreaterThanOrEqual(0);
  });

  it('returns empty songs when permission is denied', () => {
    const { result } = renderHook(() => useLocalMusicLibrary(false));

    expect(result.current.songs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 6: Extending Services
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Add search functionality to musicLibrary.service
 */

export class MusicLibraryService {
  private songs: Song[] = [];

  async fetchAudioFiles(): Promise<Song[]> {
    // ... existing code
    this.songs = songs; // Store for searching
    return songs;
  }

  /**
   * Search songs by title or artist
   */
  search(query: string): Song[] {
    return this.songs.filter((song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Use in hook
 */

export function useLocalMusicLibrary(permissionGranted: boolean) {
  const [searchQuery, setSearchQuery] = useState('');

  const displaySongs =
    searchQuery.length > 0 ? musicLibraryService.search(searchQuery) : songs;

  return {
    songs: displaySongs,
    setSearchQuery,
    // ... rest of state
  };
}

/**
 * Use in screen
 */

export function LibraryScreen() {
  const { songs, setSearchQuery } = useLocalMusicLibrary(isGranted);

  return (
    <>
      <SearchInput onChange={(text) => setSearchQuery(text)} />
      <FlatList data={songs} renderItem={({ item }) => <SongItem song={item} />} />
    </>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 7: Composition (Multiple Hooks)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Create a comprehensive player screen that uses multiple hooks
 */

export function FullPlayerScreen() {
  // Get songs
  const { isGranted } = useStoragePermission();
  const { songs } = useLocalMusicLibrary(isGranted);

  // Get playback state
  const { currentSong, play, pause } = useAudioPlayer();

  // Get user preferences
  const { favorites, toggleFavorite } = useUserLibrary();

  const currentSongIsFavorite = favorites.includes(currentSong?.id || '');

  return (
    <View>
      {/* Now Playing Section */}
      {currentSong && (
        <View>
          <SongCover uri={currentSong.uri} />
          <SongTitle>{currentSong.title}</SongTitle>
          <SongArtist>{currentSong.artist}</SongArtist>

          {/* Playback Controls */}
          <Button title="Play" onPress={() => play(currentSong)} />
          <Button title="Pause" onPress={pause} />

          {/* Favorite Button */}
          <HeartButton
            isFavorited={currentSongIsFavorite}
            onPress={() => toggleFavorite(currentSong.id)}
          />
        </View>
      )}

      {/* Queue / Library */}
      <FlatList
        data={songs}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            isPlaying={currentSong?.id === item.id}
            isFavorite={favorites.includes(item.id)}
            onPress={() => play(item)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE 8: Error Handling Patterns
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Service error handling
 */

export class MusicLibraryService {
  async fetchAudioFiles(): Promise<Song[]> {
    try {
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission not granted');
      }

      const result = await MediaLibrary.getAssetsAsync({...});
      return result.assets.map(this.assetToSong);
    } catch (error) {
      // Centralized error handling
      if (error instanceof TypeError) {
        console.error('Invalid data format:', error);
        throw new Error('Failed to parse media library data');
      }
      if (error.message.includes('permission')) {
        throw new Error('Please grant storage permission in Settings');
      }
      throw error;
    }
  }
}

/**
 * Hook error handling
 */

export function useLocalMusicLibrary(permissionGranted: boolean) {
  const [error, setError] = useState<Error | null>(null);

  const loadLibrary = async () => {
    try {
      setError(null); // Clear previous errors
      const songs = await musicLibraryService.fetchAudioFiles();
      setSongs(songs);
    } catch (err) {
      // User-friendly error message
      const message = err.message || 'Failed to load library';
      setError(new Error(message));
      // Could also send to error reporting service
      logErrorToSentry(err);
    }
  };

  return { songs, error, refetch: loadLibrary };
}

/**
 * Screen error handling
 */

export function LibraryScreen() {
  const { songs, error, refetch } = useLocalMusicLibrary(isGranted);

  if (error) {
    return (
      <ErrorView>
        <Text>{error.message}</Text>
        <Button title="Retry" onPress={refetch} />
      </ErrorView>
    );
  }

  return <SongsList songs={songs} />;
}

export {};
