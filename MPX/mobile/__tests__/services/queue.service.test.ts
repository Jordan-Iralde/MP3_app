/**
 * Queue Service Tests
 * Unit tests for queue management functionality
 */

import { queueService } from '@/services/queue.service';
import { Track } from '@/types/Track';

// Mock track data
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Song 1',
    artist: 'Artist 1',
    uri: 'track://1',
    duration: 180,
  },
  {
    id: '2',
    title: 'Song 2',
    artist: 'Artist 2',
    uri: 'track://2',
    duration: 200,
  },
  {
    id: '3',
    title: 'Song 3',
    artist: 'Artist 3',
    uri: 'track://3',
    duration: 220,
  },
];

describe('QueueService', () => {
  beforeEach(() => {
    queueService.clearQueue();
  });

  describe('Basic Operations', () => {
    test('should set queue', () => {
      queueService.setQueue(mockTracks, 0);
      const state = queueService.getState();

      expect(state.tracks).toHaveLength(3);
      expect(state.currentIndex).toBe(0);
    });

    test('should add track to queue', () => {
      queueService.setQueue(mockTracks.slice(0, 2));
      const newTrack = mockTracks[2];

      queueService.addTrack(newTrack);
      const state = queueService.getState();

      expect(state.tracks).toHaveLength(3);
      expect(state.tracks[2]).toEqual(newTrack);
    });

    test('should add track at specific position', () => {
      queueService.setQueue(mockTracks.slice(0, 2));
      const newTrack = mockTracks[2];

      queueService.addTrack(newTrack, 1);
      const state = queueService.getState();

      expect(state.tracks[1]).toEqual(newTrack);
      expect(state.tracks).toHaveLength(3);
    });

    test('should remove track at index', () => {
      queueService.setQueue(mockTracks);
      queueService.removeTrackAt(1);

      const state = queueService.getState();
      expect(state.tracks).toHaveLength(2);
      expect(state.tracks[1]).toEqual(mockTracks[2]);
    });

    test('should clear queue', () => {
      queueService.setQueue(mockTracks);
      queueService.clearQueue();

      const state = queueService.getState();
      expect(state.tracks).toHaveLength(0);
      expect(state.currentIndex).toBe(-1);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      queueService.setQueue(mockTracks, 0);
    });

    test('should move to next track', () => {
      queueService.next();
      let state = queueService.getState();
      expect(state.currentIndex).toBe(1);

      queueService.next();
      state = queueService.getState();
      expect(state.currentIndex).toBe(2);
    });

    test('should move to previous track', () => {
      queueService.next();
      queueService.next();
      queueService.previous();

      const state = queueService.getState();
      expect(state.currentIndex).toBe(1);
    });

    test('should not go past end of queue', () => {
      queueService.next();
      queueService.next();
      queueService.next();

      const state = queueService.getState();
      expect(state.currentIndex).toBe(2);
    });
  });

  describe('Drag-Drop Reordering', () => {
    beforeEach(() => {
      queueService.setQueue(mockTracks);
    });

    test('should move track forward', () => {
      queueService.moveTrack(0, 2);
      const state = queueService.getState();

      expect(state.tracks[0]).toEqual(mockTracks[1]);
      expect(state.tracks[1]).toEqual(mockTracks[2]);
      expect(state.tracks[2]).toEqual(mockTracks[0]);
    });

    test('should move track backward', () => {
      queueService.moveTrack(2, 0);
      const state = queueService.getState();

      expect(state.tracks[0]).toEqual(mockTracks[2]);
      expect(state.tracks[1]).toEqual(mockTracks[0]);
      expect(state.tracks[2]).toEqual(mockTracks[1]);
    });

    test('should adjust currentIndex when moving', () => {
      queueService.next(); // currentIndex = 1
      queueService.moveTrack(0, 2);

      const state = queueService.getState();
      // Current track should still be the same
      expect(state.tracks[state.currentIndex].id).toEqual(mockTracks[1].id);
    });
  });

  describe('Subscriptions', () => {
    test('should notify subscribers on queue change', (done) => {
      const callback = jest.fn();
      queueService.subscribe(callback);

      queueService.setQueue(mockTracks);

      // Small delay to ensure callback is called
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should unsubscribe correctly', (done) => {
      const callback = jest.fn();
      const unsubscribe = queueService.subscribe(callback);

      queueService.setQueue(mockTracks);

      unsubscribe();

      queueService.addTrack(mockTracks[0]);

      setTimeout(() => {
        // Callback should only be called once (from setQueue)
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 50);
    });
  });

  describe('State Management', () => {
    test('should return correct state', () => {
      queueService.setQueue(mockTracks, 1);
      const state = queueService.getState();

      expect(state.tracks).toEqual(mockTracks);
      expect(state.currentIndex).toBe(1);
    });

    test('should get current track', () => {
      queueService.setQueue(mockTracks, 1);
      const state = queueService.getState();
      const currentTrack = state.tracks[state.currentIndex];

      expect(currentTrack).toEqual(mockTracks[1]);
    });
  });
});
