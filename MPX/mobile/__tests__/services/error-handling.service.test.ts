import {
  errorHandlingService,
  ErrorCode,
  AppError,
} from '@/services/error-handling.service';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    errorHandlingService.clearErrorHistory();
  });

  describe('Error Creation', () => {
    test('should create error with all properties', () => {
      const error = errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'Playback failed',
        'Audio playback failed. Try again.',
        'high',
        undefined,
        true,
        { trackId: '123' }
      );

      expect(error.code).toBe(ErrorCode.AUDIO_PLAYBACK_FAILED);
      expect(error.message).toBe('Playback failed');
      expect(error.userMessage).toBe('Audio playback failed. Try again.');
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
      expect(error.context?.trackId).toBe('123');
    });

    test('should add timestamp to error', () => {
      const beforeTime = Date.now();
      const error = errorHandlingService.createError(
        ErrorCode.UNKNOWN_ERROR,
        'test',
        'test'
      );
      const afterTime = Date.now();

      expect(error.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(error.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should record error in history', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'test',
        'test'
      );
      errorHandlingService.createError(
        ErrorCode.STORAGE_WRITE_FAILED,
        'test',
        'test'
      );

      const history = errorHandlingService.getErrorHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('Audio Error Handling', () => {
    test('should handle audio not found error', () => {
      const error = new Error('File not found');
      const appError = errorHandlingService.handleAudioError(error, 'track1');

      expect(appError.code).toBe(ErrorCode.AUDIO_NOT_FOUND);
      expect(appError.context?.trackId).toBe('track1');
      expect(appError.recoverable).toBe(true);
    });

    test('should handle audio format unsupported error', () => {
      const error = new Error('Format not supported');
      const appError = errorHandlingService.handleAudioError(error);

      expect(appError.code).toBe(ErrorCode.AUDIO_FORMAT_UNSUPPORTED);
      expect(appError.recoverable).toBe(true);
    });

    test('should handle generic audio playback error', () => {
      const error = new Error('Unknown audio error');
      const appError = errorHandlingService.handleAudioError(error);

      expect(appError.code).toBe(ErrorCode.AUDIO_PLAYBACK_FAILED);
      expect(appError.severity).toBe('high');
    });
  });

  describe('Storage Error Handling', () => {
    test('should handle storage quota exceeded error', () => {
      const error = new Error('Quota exceeded');
      const appError = errorHandlingService.handleStorageError(error);

      expect(appError.code).toBe(ErrorCode.STORAGE_QUOTA_EXCEEDED);
      expect(appError.severity).toBe('high');
      expect(appError.recoverable).toBe(true);
    });

    test('should handle storage not available error', () => {
      const error = new Error('Storage not available');
      const appError = errorHandlingService.handleStorageError(error);

      expect(appError.code).toBe(ErrorCode.STORAGE_NOT_AVAILABLE);
      expect(appError.severity).toBe('critical');
      expect(appError.recoverable).toBe(false);
    });

    test('should handle generic storage write error', () => {
      const error = new Error('Write failed');
      const appError = errorHandlingService.handleStorageError(error);

      expect(appError.code).toBe(ErrorCode.STORAGE_WRITE_FAILED);
      expect(appError.recoverable).toBe(true);
    });
  });

  describe('Network Error Handling', () => {
    test('should handle network timeout error', () => {
      const error = new Error('Request timeout');
      const appError = errorHandlingService.handleNetworkError(error);

      expect(appError.code).toBe(ErrorCode.NETWORK_TIMEOUT);
      expect(appError.recoverable).toBe(true);
    });

    test('should handle network no connection error', () => {
      const error = new Error('no connection to internet');
      const appError = errorHandlingService.handleNetworkError(error);

      expect(appError.code).toBe(ErrorCode.NETWORK_NO_CONNECTION);
      expect(appError.recoverable).toBe(true);
    });

    test('should handle generic network error', () => {
      const error = new Error('Network error');
      const appError = errorHandlingService.handleNetworkError(error);

      expect(appError.code).toBe(ErrorCode.NETWORK_REQUEST_FAILED);
      expect(appError.recoverable).toBe(true);
    });
  });

  describe('Permission Error Handling', () => {
    test('should handle permission denied', () => {
      const appError = errorHandlingService.handlePermissionError('MEDIA');

      expect(appError.code).toBe(ErrorCode.PERMISSION_DENIED);
      expect(appError.context?.permission).toBe('MEDIA');
      expect(appError.recoverable).toBe(true);
    });
  });

  describe('Retry with Exponential Backoff', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await errorHandlingService.retryWithBackoff(
        operation,
        3,
        10
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure', async () => {
      let attempts = 0;
      const operation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      const result = await errorHandlingService.retryWithBackoff(
        operation,
        3,
        1
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should throw after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(
        errorHandlingService.retryWithBackoff(operation, 2, 1)
      ).rejects.toThrow('Failed');

      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should increase delay between retries', async () => {
      const timings: number[] = [];
      let attempts = 0;

      const operation = jest.fn(async () => {
        timings.push(Date.now());
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      await errorHandlingService.retryWithBackoff(operation, 3, 10);

      // Verify delays are increasing
      if (timings.length >= 2) {
        const delay1 = timings[1] - timings[0];
        if (timings.length >= 3) {
          const delay2 = timings[2] - timings[1];
          expect(delay2).toBeGreaterThanOrEqual(delay1);
        }
      }
    });
  });

  describe('Error History', () => {
    test('should retrieve all errors', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'error1',
        'user1'
      );
      errorHandlingService.createError(
        ErrorCode.STORAGE_WRITE_FAILED,
        'error2',
        'user2'
      );

      const history = errorHandlingService.getErrorHistory();
      expect(history).toHaveLength(2);
    });

    test('should filter errors by code', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'error1',
        'user1'
      );
      errorHandlingService.createError(
        ErrorCode.STORAGE_WRITE_FAILED,
        'error2',
        'user2'
      );

      const history = errorHandlingService.getErrorHistory(
        ErrorCode.AUDIO_PLAYBACK_FAILED
      );
      expect(history).toHaveLength(1);
      expect(history[0].code).toBe(ErrorCode.AUDIO_PLAYBACK_FAILED);
    });

    test('should filter errors by severity', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'error1',
        'user1',
        'high'
      );
      errorHandlingService.createError(
        ErrorCode.STORAGE_WRITE_FAILED,
        'error2',
        'user2',
        'critical'
      );

      const history = errorHandlingService.getErrorHistory(
        undefined,
        'critical'
      );
      expect(history).toHaveLength(1);
      expect(history[0].severity).toBe('critical');
    });

    test('should clear error history', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'error1',
        'user1'
      );
      errorHandlingService.clearErrorHistory();

      const history = errorHandlingService.getErrorHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Error Subscriptions', () => {
    test('should notify subscribers of new errors', (done) => {
      const listener = jest.fn((error: AppError) => {
        expect(error.code).toBe(ErrorCode.AUDIO_PLAYBACK_FAILED);
        done();
      });

      errorHandlingService.subscribe(listener);
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'test',
        'test'
      );
    });

    test('should allow unsubscribing', () => {
      const listener = jest.fn();
      const unsubscribe = errorHandlingService.subscribe(listener);

      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'test',
        'test'
      );
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      errorHandlingService.createError(
        ErrorCode.STORAGE_WRITE_FAILED,
        'test',
        'test'
      );
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Export', () => {
    test('should export errors as JSON string', () => {
      errorHandlingService.createError(
        ErrorCode.AUDIO_PLAYBACK_FAILED,
        'error1',
        'user1'
      );

      const exported = errorHandlingService.exportErrors();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('Error History Limit', () => {
    test('should limit error history to MAX_ERROR_HISTORY', () => {
      // Create more errors than MAX_ERROR_HISTORY
      const MAX_HISTORY = 100;
      for (let i = 0; i < MAX_HISTORY + 50; i++) {
        errorHandlingService.createError(
          ErrorCode.AUDIO_PLAYBACK_FAILED,
          `error${i}`,
          `user${i}`
        );
      }

      const history = errorHandlingService.getErrorHistory();
      expect(history.length).toBeLessThanOrEqual(MAX_HISTORY);
    });
  });
});
