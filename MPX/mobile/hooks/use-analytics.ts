import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { loggerService } from '@/services/logger.service';

/**
 * Hook to track user engagement and feature usage
 */
export function useAnalytics() {
  const trackPlayback = (trackTitle: string, artist: string) => {
    analyticsService.trackPlayback(trackTitle, artist);
    loggerService.info('Analytics', 'Track played', { trackTitle, artist });
  };

  const trackPause = (duration: number) => {
    analyticsService.trackPause(duration);
    loggerService.info('Analytics', 'Track paused', { duration });
  };

  const trackPlaylistCreated = (name: string, trackCount: number) => {
    analyticsService.trackPlaylistCreated(name, trackCount);
    loggerService.info('Analytics', 'Playlist created', { name, trackCount });
  };

  const trackFeature = (feature: string, action: string) => {
    analyticsService.trackFeature(feature, action);
    loggerService.debug('Analytics', `Feature ${feature} used`, { action });
  };

  const trackSleepTimer = (duration: number) => {
    analyticsService.trackSleepTimer(duration);
    loggerService.info('Analytics', 'Sleep timer started', { duration });
  };

  const trackReorder = (source: 'playlist' | 'queue', itemCount: number) => {
    analyticsService.trackReorder(source, itemCount);
    loggerService.info('Analytics', 'Items reordered', { source, itemCount });
  };

  const getStats = () => analyticsService.getStats();

  return {
    trackPlayback,
    trackPause,
    trackPlaylistCreated,
    trackFeature,
    trackSleepTimer,
    trackReorder,
    getStats,
  };
}

/**
 * Hook to automatically track playback start/stop
 */
export function usePlaybackTracking(trackTitle?: string, artist?: string) {
  const { trackPlayback, trackPause } = useAnalytics();
  const [startTime, setStartTime] = useState<number | null>(null);

  const handlePlaybackStart = () => {
    if (trackTitle && artist) {
      trackPlayback(trackTitle, artist);
      setStartTime(Date.now());
    }
  };

  const handlePlaybackEnd = () => {
    if (startTime) {
      const duration = Date.now() - startTime;
      trackPause(duration);
      setStartTime(null);
    }
  };

  return {
    onPlayStart: handlePlaybackStart,
    onPlayEnd: handlePlaybackEnd,
  };
}
