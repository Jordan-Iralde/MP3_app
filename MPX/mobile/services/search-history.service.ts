import { asyncStorageGetItem, asyncStorageSetItem, initAsyncStorage } from '@/utils/asyncStorageHelper';

const SEARCH_HISTORY_KEY = '@resonix/search_history';
const MAX_HISTORY_ENTRIES = 20;

export interface SearchHistoryItem {
  term: string;
  timestamp: number;
}

export class SearchHistoryService {
  private static instance: SearchHistoryService;
  private history: SearchHistoryItem[] = [];
  private listeners: Set<(history: SearchHistoryItem[]) => void> = new Set();
  private isLoading = false;
  private saveLock = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): SearchHistoryService {
    if (!SearchHistoryService.instance) {
      SearchHistoryService.instance = new SearchHistoryService();
    }
    return SearchHistoryService.instance;
  }

  /**
   * Initialize and load search history from AsyncStorage
   */
  private async initialize(): Promise<void> {
    try {
      this.isLoading = true;
      // Ensure AsyncStorage is ready
      await initAsyncStorage();

      const data = await asyncStorageGetItem(SEARCH_HISTORY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Validate data structure
        if (Array.isArray(parsed) && parsed.every((item) => item.term && item.timestamp)) {
          // Sort by most recent first
          this.history = parsed.sort((a, b) => b.timestamp - a.timestamp);
          console.log('[SearchHistoryService] Loaded search history:', this.history.length, 'entries');
        } else {
          this.history = [];
        }
      } else {
        this.history = [];
      }
    } catch (error) {
      console.error('[SearchHistoryService] Error loading search history:', error);
      this.history = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add search term to history
   */
  async addSearchTerm(term: string): Promise<void> {
    try {
      // Normalize term
      const normalizedTerm = term.trim();
      if (!normalizedTerm) {
        return;
      }

      // Remove if already exists (will add at the beginning)
      this.history = this.history.filter((item) => item.term.toLowerCase() !== normalizedTerm.toLowerCase());

      // Add new entry at the beginning
      const newEntry: SearchHistoryItem = {
        term: normalizedTerm,
        timestamp: Date.now(),
      };
      this.history.unshift(newEntry);

      // Keep only MAX_HISTORY_ENTRIES
      if (this.history.length > MAX_HISTORY_ENTRIES) {
        this.history = this.history.slice(0, MAX_HISTORY_ENTRIES);
      }

      // Persist to AsyncStorage (with lock to prevent race conditions)
      await this.persistWithLock();
      this.notifyListeners();

      console.log('[SearchHistoryService] Search term added:', normalizedTerm);
    } catch (error) {
      console.error('[SearchHistoryService] Error adding search term:', error);
    }
  }

  /**
   * Remove individual search term
   */
  async removeSearchTerm(term: string): Promise<void> {
    try {
      this.history = this.history.filter((item) => item.term.toLowerCase() !== term.toLowerCase());
      await this.persistWithLock();
      this.notifyListeners();

      console.log('[SearchHistoryService] Search term removed:', term);
    } catch (error) {
      console.error('[SearchHistoryService] Error removing search term:', error);
    }
  }

  /**
   * Clear all search history
   */
  async clearAll(): Promise<void> {
    try {
      this.history = [];
      await this.persistWithLock();
      this.notifyListeners();

      console.log('[SearchHistoryService] Search history cleared');
    } catch (error) {
      console.error('[SearchHistoryService] Error clearing search history:', error);
    }
  }

  /**
   * Get all search history
   */
  getHistory(): SearchHistoryItem[] {
    return [...this.history];
  }

  /**
   * Get recent search history (limited number)
   */
  getRecentHistory(limit: number = 10): SearchHistoryItem[] {
    return this.history.slice(0, limit);
  }

  /**
   * Check if term exists in history
   */
  hasSearchTerm(term: string): boolean {
    return this.history.some((item) => item.term.toLowerCase() === term.toLowerCase());
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: (history: SearchHistoryItem[]) => void): () => void {
    this.listeners.add(listener);
    // Notify immediately with current data if loaded
    if (!this.isLoading) {
      listener(this.getHistory());
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
   * Private: Persist to AsyncStorage with lock to prevent race conditions
   */
  private async persistWithLock(): Promise<void> {
    // Wait if another save is in progress
    while (this.saveLock) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    try {
      this.saveLock = true;
      const data = JSON.stringify(this.history);
      await asyncStorageSetItem(SEARCH_HISTORY_KEY, data);
      console.log('[SearchHistoryService] Search history persisted');
    } catch (error) {
      console.error('[SearchHistoryService] Error persisting search history:', error);
    } finally {
      this.saveLock = false;
    }
  }

  /**
   * Private: Notify listeners
   */
  private notifyListeners(): void {
    const data = this.getHistory();
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('[SearchHistoryService] Listener error:', error);
      }
    });
  }
}

export const searchHistoryService = SearchHistoryService.getInstance();
