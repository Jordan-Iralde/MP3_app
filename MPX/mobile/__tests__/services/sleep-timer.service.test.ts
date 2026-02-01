/**
 * Sleep Timer Service Tests
 * Unit tests for sleep timer functionality
 */

import { sleepTimerService } from '@/services/sleep-timer.service';

describe('SleepTimerService', () => {
  beforeEach(() => {
    sleepTimerService.stop();
  });

  afterEach(() => {
    sleepTimerService.stop();
  });

  describe('Timer Lifecycle', () => {
    test('should start timer', () => {
      sleepTimerService.start(5);
      const state = sleepTimerService.getState();

      expect(state.isActive).toBe(true);
      expect(state.duration).toBe(5 * 60 * 1000);
    });

    test('should pause timer', (done) => {
      sleepTimerService.start(5);

      setTimeout(() => {
        sleepTimerService.pause();
        const state = sleepTimerService.getState();

        expect(state.isPaused).toBe(true);
        done();
      }, 100);
    });

    test('should resume timer', (done) => {
      sleepTimerService.start(5);

      setTimeout(() => {
        sleepTimerService.pause();
        sleepTimerService.resume();

        const state = sleepTimerService.getState();
        expect(state.isPaused).toBe(false);
        done();
      }, 100);
    });

    test('should stop timer', () => {
      sleepTimerService.start(5);
      sleepTimerService.stop();

      const state = sleepTimerService.getState();
      expect(state.isActive).toBe(false);
      expect(state.remainingMs).toBe(0);
    });
  });

  describe('Duration Options', () => {
    const durations = [5, 10, 15, 30, 60];

    test.each(durations)('should support %i minute duration', (minutes) => {
      sleepTimerService.start(minutes);
      const state = sleepTimerService.getState();

      expect(state.duration).toBe(minutes * 60 * 1000);
    });
  });

  describe('Time Formatting', () => {
    test('should format time correctly', () => {
      sleepTimerService.start(5);
      const time = sleepTimerService.getFormattedTime();

      expect(time).toMatch(/^\d{2}:\d{2}$/);
    });

    test('should show decreasing time', (done) => {
      sleepTimerService.start(1);
      const startTime = sleepTimerService.getFormattedTime();

      setTimeout(() => {
        const endTime = sleepTimerService.getFormattedTime();
        expect(endTime).not.toEqual(startTime);
        done();
      }, 1100); // Wait more than 1 second
    });
  });

  describe('Progress Tracking', () => {
    test('should calculate progress correctly', () => {
      sleepTimerService.start(10);
      const progress = sleepTimerService.getProgress();

      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    test('should return 0 progress when not active', () => {
      const progress = sleepTimerService.getProgress();
      expect(progress).toBe(0);
    });
  });

  describe('Time Addition', () => {
    test('should add time to running timer', () => {
      sleepTimerService.start(5);
      const initialTime = sleepTimerService.getFormattedTime();

      sleepTimerService.addTime(5);
      const newTime = sleepTimerService.getFormattedTime();

      expect(newTime).not.toEqual(initialTime);
    });
  });

  describe('Expiry Callback', () => {
    test('should call onExpire callback', (done) => {
      const callback = jest.fn();

      sleepTimerService.start(0.1, callback); // 6 seconds for testing

      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        done();
      }, 1200);
    });
  });

  describe('Subscriptions', () => {
    test('should notify subscribers on timer change', (done) => {
      const callback = jest.fn();
      sleepTimerService.subscribe(callback);

      sleepTimerService.start(5);

      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should unsubscribe correctly', (done) => {
      const callback = jest.fn();
      const unsubscribe = sleepTimerService.subscribe(callback);

      sleepTimerService.start(5);

      setTimeout(() => {
        unsubscribe();
        const callCount = callback.mock.calls.length;

        sleepTimerService.pause();

        setTimeout(() => {
          expect(callback).toHaveBeenCalledTimes(callCount);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('State Management', () => {
    test('should return correct state', () => {
      sleepTimerService.start(10);
      const state = sleepTimerService.getState();

      expect(state.isActive).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.duration).toBe(10 * 60 * 1000);
    });

    test('should return remaining minutes', (done) => {
      sleepTimerService.start(5);

      setTimeout(() => {
        const remaining = sleepTimerService.getRemainingMinutes();
        expect(remaining).toBeGreaterThanOrEqual(0);
        expect(remaining).toBeLessThanOrEqual(5);
        done();
      }, 100);
    });
  });
});
