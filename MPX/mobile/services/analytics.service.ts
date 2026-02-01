/**
 * Analytics Service - Track user engagement and feature usage
 */

interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface UserStats {
  totalPlays: number;
  totalPausedSessions: number;
  totalListeningTime: number; // milliseconds
  favoriteGenres: string[];
  mostPlayedArtists: string[];
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private userStats: UserStats = {
    totalPlays: 0,
    totalPausedSessions: 0,
    totalListeningTime: 0,
    favoriteGenres: [],
    mostPlayedArtists: [],
  };
  private readonly MAX_EVENTS = 5000;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track a user event
   */
  trackEvent(name: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      properties,
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    // Update user stats based on event
    this.updateStats(name, properties);
  }

  /**
   * Track play event
   */
  trackPlayback(trackTitle: string, artist: string): void {
    this.trackEvent('track_played', {
      title: trackTitle,
      artist,
    });
    this.userStats.totalPlays++;
  }

  /**
   * Track pause event
   */
  trackPause(listeningDuration: number): void {
    this.trackEvent('track_paused', {
      duration: listeningDuration,
    });
    this.userStats.totalPausedSessions++;
    this.userStats.totalListeningTime += listeningDuration;
  }

  /**
   * Track playlist creation
   */
  trackPlaylistCreated(name: string, trackCount: number): void {
    this.trackEvent('playlist_created', {
      name,
      trackCount,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(feature: string, action: string): void {
    this.trackEvent(`feature_${feature}`, {
      action,
    });
  }

  /**
   * Track sleep timer usage
   */
  trackSleepTimer(duration: number): void {
    this.trackEvent('sleep_timer_started', {
      duration,
    });
  }

  /**
   * Track drag-drop reorder
   */
  trackReorder(source: 'playlist' | 'queue', itemCount: number): void {
    this.trackEvent('reorder', {
      source,
      itemCount,
    });
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get user stats
   */
  getStats(): UserStats {
    return { ...this.userStats };
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.name === name);
  }

  /**
   * Get events in time range
   */
  getEventsByTimeRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter(
      (e) => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Clear analytics
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Update user stats based on events
   */
  private updateStats(
    eventName: string,
    properties?: Record<string, any>
  ): void {
    if (eventName === 'track_played' && properties?.artist) {
      const artist = properties.artist;
      const index = this.userStats.mostPlayedArtists.indexOf(artist);

      if (index === -1) {
        this.userStats.mostPlayedArtists.unshift(artist);
      } else {
        // Move to front
        this.userStats.mostPlayedArtists.splice(index, 1);
        this.userStats.mostPlayedArtists.unshift(artist);
      }

      // Keep top 10
      if (this.userStats.mostPlayedArtists.length > 10) {
        this.userStats.mostPlayedArtists.pop();
      }
    }
  }

  /**
   * Export analytics as JSON
   */
  export(): string {
    return JSON.stringify(
      {
        events: this.events,
        stats: this.userStats,
      },
      null,
      2
    );
  }
}

export const analyticsService = AnalyticsService.getInstance();
