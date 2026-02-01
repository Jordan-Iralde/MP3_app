import { initAsyncStorage, asyncStorageGetItem, asyncStorageSetItem } from '@/utils/asyncStorageHelper';

const FAVORITES_KEY = '@resonix/favorites';

export interface FavoritesData {
  [trackUri: string]: {
    isFavorite: boolean;
    addedAt: number;
  };
}

export class FavoritesService {
  private static instance: FavoritesService;
  private favorites: FavoritesData = {};
  private listeners: Set<(favorites: FavoritesData) => void> = new Set();
  private isLoading = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  /**
   * Initialize AsyncStorage and load favorites
   */
  private async initialize(): Promise<void> {
    try {
      this.isLoading = true;
      // Ensure AsyncStorage is initialized
      await initAsyncStorage();
      // Load favorites from AsyncStorage
      const data = await asyncStorageGetItem(FAVORITES_KEY);
      if (data) {
        this.favorites = JSON.parse(data);
        console.log('[FavoritesService] Loaded favorites:', Object.keys(this.favorites).length);
      } else {
        this.favorites = {};
      }
    } catch (error) {
      console.error('[FavoritesService] Error loading favorites:', error);
      this.favorites = {};
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Toggle favorite status for a track
   */
  async toggleFavorite(trackUri: string): Promise<boolean> {
    try {
      const currentState = this.isFavorite(trackUri);
      const newState = !currentState;

      this.favorites[trackUri] = {
        isFavorite: newState,
        addedAt: Date.now(),
      };

      await this.persist();
      this.notifyListeners();

      console.log(`[FavoritesService] Track ${newState ? 'added to' : 'removed from'} favorites:`, trackUri);
      return newState;
    } catch (error) {
      console.error('[FavoritesService] Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Add track to favorites
   */
  async addFavorite(trackUri: string): Promise<void> {
    try {
      if (!this.isFavorite(trackUri)) {
        this.favorites[trackUri] = {
          isFavorite: true,
          addedAt: Date.now(),
        };
        await this.persist();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[FavoritesService] Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * Remove track from favorites
   */
  async removeFavorite(trackUri: string): Promise<void> {
    try {
      if (this.isFavorite(trackUri)) {
        delete this.favorites[trackUri];
        await this.persist();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[FavoritesService] Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Check if track is favorite
   */
  isFavorite(trackUri: string): boolean {
    return this.favorites[trackUri]?.isFavorite ?? false;
  }

  /**
   * Get all favorite URIs
   */
  getAllFavorites(): string[] {
    return Object.keys(this.favorites).filter((uri) => this.favorites[uri].isFavorite);
  }

  /**
   * Get all favorites data
   */
  getFavoritesData(): FavoritesData {
    return { ...this.favorites };
  }

  /**
   * Clear all favorites
   */
  async clearAllFavorites(): Promise<void> {
    try {
      this.favorites = {};
      await this.persist();
      this.notifyListeners();
      console.log('[FavoritesService] All favorites cleared');
    } catch (error) {
      console.error('[FavoritesService] Error clearing favorites:', error);
      throw error;
    }
  }

  /**
   * Subscribe to favorites changes
   */
  subscribe(listener: (favorites: FavoritesData) => void): () => void {
    this.listeners.add(listener);
    // Notify immediately with current data if loaded
    if (!this.isLoading) {
      listener(this.getFavoritesData());
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
      const data = JSON.stringify(this.favorites);
      const success = await asyncStorageSetItem(FAVORITES_KEY, data);
      if (success) {
        console.log('[FavoritesService] Favorites persisted');
      }
    } catch (error) {
      console.error('[FavoritesService] Error persisting favorites:', error);
    }
  }

  /**
   * Private: Notify listeners
   */
  private notifyListeners(): void {
    const data = this.getFavoritesData();
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('[FavoritesService] Listener error:', error);
      }
    });
  }
}

export const favoritesService = FavoritesService.getInstance();
