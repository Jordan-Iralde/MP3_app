import { Track } from '@/types/Track';

export interface QueueState {
  tracks: Track[];
  currentIndex: number;
}

export class QueueService {
  private static instance: QueueService;
  private queue: Track[] = [];
  private currentIndex: number = -1;
  private listeners: Set<(state: QueueState) => void> = new Set();

  private constructor() {}

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Set queue and start from index
   */
  setQueue(tracks: Track[], startIndex: number = 0): void {
    this.queue = [...tracks];
    this.currentIndex = Math.max(-1, Math.min(startIndex, tracks.length - 1));
    this.notifyListeners();
    console.log(`[QueueService] Queue set with ${tracks.length} tracks, starting at index ${this.currentIndex}`);
  }

  /**
   * Add track to queue
   */
  addTrack(track: Track, position?: number): void {
    if (position === undefined || position >= this.queue.length) {
      this.queue.push(track);
    } else {
      this.queue.splice(position, 0, track);
      // Adjust currentIndex if track was added before current track
      if (position <= this.currentIndex) {
        this.currentIndex++;
      }
    }
    this.notifyListeners();
    console.log(`[QueueService] Track added: ${track.title}`);
  }

  /**
   * Remove track from queue by index
   */
  removeTrackAt(index: number): void {
    if (index < 0 || index >= this.queue.length) {
      throw new Error(`Invalid track index: ${index}`);
    }

    const track = this.queue[index];
    this.queue.splice(index, 1);

    // Adjust currentIndex
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex) {
      // If removed track is current, move to next
      if (this.currentIndex >= this.queue.length) {
        this.currentIndex = Math.max(-1, this.queue.length - 1);
      }
    }

    this.notifyListeners();
    console.log(`[QueueService] Track removed: ${track.title}`);
  }

  /**
   * Remove track by URI
   */
  removeTrackByUri(uri: string): void {
    const index = this.queue.findIndex((t) => t.uri === uri);
    if (index !== -1) {
      this.removeTrackAt(index);
    }
  }

  /**
   * Move track to new position (drag-drop)
   */
  moveTrack(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.queue.length) {
      throw new Error(`Invalid fromIndex: ${fromIndex}`);
    }
    if (toIndex < 0 || toIndex >= this.queue.length) {
      throw new Error(`Invalid toIndex: ${toIndex}`);
    }

    const track = this.queue[fromIndex];
    this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, track);

    // Adjust currentIndex based on move
    if (fromIndex === this.currentIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }

    this.notifyListeners();
    console.log(`[QueueService] Track moved from ${fromIndex} to ${toIndex}`);
  }

  /**
   * Clear entire queue
   */
  clearQueue(): void {
    this.queue = [];
    this.currentIndex = -1;
    this.notifyListeners();
    console.log('[QueueService] Queue cleared');
  }

  /**
   * Get current track
   */
  getCurrentTrack(): Track | null {
    if (this.currentIndex === -1 || this.currentIndex >= this.queue.length) {
      return null;
    }
    return this.queue[this.currentIndex];
  }

  /**
   * Set current track by index
   */
  setCurrentIndex(index: number): void {
    if (index < -1 || index >= this.queue.length) {
      throw new Error(`Invalid current index: ${index}`);
    }
    this.currentIndex = index;
    this.notifyListeners();
  }

  /**
   * Get next track
   */
  getNextTrack(): Track | null {
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.queue.length) {
      return null;
    }
    return this.queue[nextIndex];
  }

  /**
   * Get previous track
   */
  getPreviousTrack(): Track | null {
    const prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      return null;
    }
    return this.queue[prevIndex];
  }

  /**
   * Go to next track
   */
  next(): boolean {
    if (this.currentIndex + 1 < this.queue.length) {
      this.currentIndex++;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Go to previous track
   */
  previous(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get full queue
   */
  getQueue(): Track[] {
    return [...this.queue];
  }

  /**
   * Get queue state
   */
  getState(): QueueState {
    return {
      tracks: [...this.queue],
      currentIndex: this.currentIndex,
    };
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue has tracks
   */
  hasQueue(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (state: QueueState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Private: Notify listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('[QueueService] Listener error:', error);
      }
    });
  }
}

export const queueService = QueueService.getInstance();
