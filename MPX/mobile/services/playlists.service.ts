import { asyncStorageGetItem, asyncStorageSetItem } from '@/utils/asyncStorageHelper';
import { Track } from '@/types/Track';

const PLAYLISTS_KEY = '@resonix/playlists';

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistsData {
  [playlistId: string]: Playlist;
}

export class PlaylistsService {
  private static instance: PlaylistsService;
  private playlists: PlaylistsData = {};
  private listeners: Set<(playlists: PlaylistsData) => void> = new Set();
  private isLoading = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PlaylistsService {
    if (!PlaylistsService.instance) {
      PlaylistsService.instance = new PlaylistsService();
    }
    return PlaylistsService.instance;
  }

  /**
   * Initialize and load playlists from AsyncStorage
   */
  private async initialize(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await asyncStorageGetItem(PLAYLISTS_KEY);
      if (data) {
        this.playlists = JSON.parse(data);
        console.log('[PlaylistsService] Loaded playlists:', Object.keys(this.playlists).length);
      } else {
        this.playlists = {};
      }
    } catch (error) {
      console.error('[PlaylistsService] Error loading playlists:', error);
      this.playlists = {};
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(name: string): Promise<Playlist> {
    try {
      const id = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      const playlist: Playlist = {
        id,
        name,
        tracks: [],
        createdAt: now,
        updatedAt: now,
      };

      this.playlists[id] = playlist;
      await this.persist();
      this.notifyListeners();

      console.log('[PlaylistsService] Playlist created:', name);
      return playlist;
    } catch (error) {
      console.error('[PlaylistsService] Error creating playlist:', error);
      throw error;
    }
  }

  /**
   * Rename a playlist
   */
  async renamePlaylist(playlistId: string, newName: string): Promise<void> {
    try {
      if (!this.playlists[playlistId]) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      this.playlists[playlistId].name = newName;
      this.playlists[playlistId].updatedAt = Date.now();

      await this.persist();
      this.notifyListeners();

      console.log('[PlaylistsService] Playlist renamed:', newName);
    } catch (error) {
      console.error('[PlaylistsService] Error renaming playlist:', error);
      throw error;
    }
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      if (!this.playlists[playlistId]) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      delete this.playlists[playlistId];
      await this.persist();
      this.notifyListeners();

      console.log('[PlaylistsService] Playlist deleted');
    } catch (error) {
      console.error('[PlaylistsService] Error deleting playlist:', error);
      throw error;
    }
  }

  /**
   * Add track to playlist
   */
  async addTrackToPlaylist(playlistId: string, track: Track): Promise<void> {
    try {
      if (!this.playlists[playlistId]) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      const playlist = this.playlists[playlistId];

      // Avoid duplicates
      if (!playlist.tracks.some((t) => t.uri === track.uri)) {
        playlist.tracks.push(track);
        playlist.updatedAt = Date.now();

        await this.persist();
        this.notifyListeners();

        console.log('[PlaylistsService] Track added to playlist:', track.title);
      }
    } catch (error) {
      console.error('[PlaylistsService] Error adding track to playlist:', error);
      throw error;
    }
  }

  /**
   * Remove track from playlist
   */
  async removeTrackFromPlaylist(playlistId: string, trackUri: string): Promise<void> {
    try {
      if (!this.playlists[playlistId]) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      const playlist = this.playlists[playlistId];
      playlist.tracks = playlist.tracks.filter((t) => t.uri !== trackUri);
      playlist.updatedAt = Date.now();

      await this.persist();
      this.notifyListeners();

      console.log('[PlaylistsService] Track removed from playlist');
    } catch (error) {
      console.error('[PlaylistsService] Error removing track from playlist:', error);
      throw error;
    }
  }

  /**
   * Update playlist tracks (for reordering)
   */
  async updatePlaylistTracks(playlistId: string, tracks: Track[]): Promise<void> {
    try {
      if (!this.playlists[playlistId]) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      this.playlists[playlistId].tracks = tracks;
      this.playlists[playlistId].updatedAt = Date.now();

      await this.persist();
      this.notifyListeners();

      console.log('[PlaylistsService] Playlist tracks updated');
    } catch (error) {
      console.error('[PlaylistsService] Error updating playlist tracks:', error);
      throw error;
    }
  }

  /**
   * Get all playlists
   */
  getAllPlaylists(): Playlist[] {
    return Object.values(this.playlists);
  }

  /**
   * Get playlist by ID
   */
  getPlaylist(playlistId: string): Playlist | undefined {
    return this.playlists[playlistId];
  }

  /**
   * Get tracks from playlist
   */
  getPlaylistTracks(playlistId: string): Track[] {
    const playlist = this.playlists[playlistId];
    return playlist ? playlist.tracks : [];
  }

  /**
   * Check if track exists in playlist
   */
  hasTrackInPlaylist(playlistId: string, trackUri: string): boolean {
    const playlist = this.playlists[playlistId];
    return playlist ? playlist.tracks.some((t) => t.uri === trackUri) : false;
  }

  /**
   * Get all playlists data
   */
  getPlaylistsData(): PlaylistsData {
    return { ...this.playlists };
  }

  /**
   * Clear all playlists
   */
  async clearAllPlaylists(): Promise<void> {
    try {
      this.playlists = {};
      await this.persist();
      this.notifyListeners();
      console.log('[PlaylistsService] All playlists cleared');
    } catch (error) {
      console.error('[PlaylistsService] Error clearing playlists:', error);
      throw error;
    }
  }

  /**
   * Subscribe to playlists changes
   */
  subscribe(listener: (playlists: PlaylistsData) => void): () => void {
    this.listeners.add(listener);
    // Notify immediately with current data if loaded
    if (!this.isLoading) {
      listener(this.getPlaylistsData());
    }
    return () => this.listeners.delete(listener);
  }

  /**
   * Wait for initialization
   */
  async ready(): Promise<void> {
    let attempts = 0;
    while (this.isLoading && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      attempts++;
    }
  }

  /**
   * Private: Persist to AsyncStorage
   */
  private async persist(): Promise<void> {
    try {
      const data = JSON.stringify(this.playlists);
      await asyncStorageSetItem(PLAYLISTS_KEY, data);
      console.log('[PlaylistsService] Playlists persisted');
    } catch (error) {
      console.error('[PlaylistsService] Error persisting playlists:', error);
    }
  }

  /**
   * Private: Notify listeners
   */
  private notifyListeners(): void {
    const data = this.getPlaylistsData();
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('[PlaylistsService] Listener error:', error);
      }
    });
  }
}

export const playlistsService = PlaylistsService.getInstance();
