/**
 * Error Handling Service
 * Centralized error management with recovery strategies
 * Provides error codes, logging, and user-friendly messages
 */

export enum ErrorCode {
  // Audio errors
  AUDIO_PLAYBACK_FAILED = 'AUDIO_001',
  AUDIO_LOAD_FAILED = 'AUDIO_002',
  AUDIO_NOT_FOUND = 'AUDIO_003',
  AUDIO_FORMAT_UNSUPPORTED = 'AUDIO_004',

  // Storage errors
  STORAGE_READ_FAILED = 'STORAGE_001',
  STORAGE_WRITE_FAILED = 'STORAGE_002',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_003',
  STORAGE_NOT_AVAILABLE = 'STORAGE_004',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_001',
  NETWORK_NO_CONNECTION = 'NETWORK_002',
  NETWORK_REQUEST_FAILED = 'NETWORK_003',

  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_001',
  PERMISSION_NOT_GRANTED = 'PERMISSION_002',

  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_001',
  INVALID_INPUT = 'VALIDATION_002',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_001',
  NOT_IMPLEMENTED = 'UNKNOWN_002',
}

export interface AppError {
  code: ErrorCode | string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  originalError?: Error;
  context?: Record<string, any>;
  recoverable: boolean;
}

class ErrorHandlingService {
  private errorHistory: AppError[] = [];
  private readonly MAX_ERROR_HISTORY = 100;
  private errorListeners: Array<(error: AppError) => void> = [];

  /**
   * Create an application error
   */
  createError(
    code: ErrorCode | string,
    message: string,
    userMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    originalError?: Error,
    recoverable = false,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      code,
      message,
      userMessage,
      severity,
      timestamp: Date.now(),
      originalError,
      context,
      recoverable,
    };

    this.recordError(error);
    this.notifyListeners(error);

    return error;
  }

  /**
   * Handle audio playback errors
   */
  handleAudioError(error: Error, trackId?: string): AppError {
    const context = trackId ? { trackId } : undefined;

    if (error.message.includes('not found')) {
      return this.createError(
        ErrorCode.AUDIO_NOT_FOUND,
        error.message,
        'Audio file not found. Please try another track.',
        'medium',
        error,
        true,
        context
      );
    }

    if (error.message.includes('format')) {
      return this.createError(
        ErrorCode.AUDIO_FORMAT_UNSUPPORTED,
        error.message,
        'This audio format is not supported.',
        'medium',
        error,
        true,
        context
      );
    }

    return this.createError(
      ErrorCode.AUDIO_PLAYBACK_FAILED,
      error.message,
      'Failed to play audio. Please try again.',
      'high',
      error,
      true,
      context
    );
  }

  /**
   * Handle storage errors
   */
  handleStorageError(error: Error): AppError {
    if (error.message.includes('quota')) {
      return this.createError(
        ErrorCode.STORAGE_QUOTA_EXCEEDED,
        error.message,
        'Storage quota exceeded. Please free up some space.',
        'high',
        error,
        true
      );
    }

    if (error.message.includes('not available')) {
      return this.createError(
        ErrorCode.STORAGE_NOT_AVAILABLE,
        error.message,
        'Storage is not available. Please check your device.',
        'critical',
        error,
        false
      );
    }

    return this.createError(
      ErrorCode.STORAGE_WRITE_FAILED,
      error.message,
      'Failed to save data. Please try again.',
      'high',
      error,
      true
    );
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error): AppError {
    if (error.message.includes('timeout')) {
      return this.createError(
        ErrorCode.NETWORK_TIMEOUT,
        error.message,
        'Request timed out. Please check your connection.',
        'medium',
        error,
        true
      );
    }

    if (error.message.includes('no connection')) {
      return this.createError(
        ErrorCode.NETWORK_NO_CONNECTION,
        error.message,
        'No internet connection. Please check your network.',
        'medium',
        error,
        true
      );
    }

    return this.createError(
      ErrorCode.NETWORK_REQUEST_FAILED,
      error.message,
      'Network request failed. Please try again.',
      'medium',
      error,
      true
    );
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(permission: string): AppError {
    return this.createError(
      ErrorCode.PERMISSION_DENIED,
      `Permission denied: ${permission}`,
      `This feature requires ${permission} permission.`,
      'medium',
      undefined,
      true,
      { permission }
    );
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const delayMs = initialDelayMs * Math.pow(2, attempt);

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Record error to history
   */
  private recordError(error: AppError): void {
    this.errorHistory.push(error);

    // Keep only recent errors
    if (this.errorHistory.length > this.MAX_ERROR_HISTORY) {
      this.errorHistory = this.errorHistory.slice(-this.MAX_ERROR_HISTORY);
    }
  }

  /**
   * Notify error listeners
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Subscribe to errors
   */
  subscribe(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);

    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get error history
   */
  getErrorHistory(
    code?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): AppError[] {
    return this.errorHistory.filter((error) => {
      const codeMatch = !code || error.code === code;
      const severityMatch = !severity || error.severity === severity;
      return codeMatch && severityMatch;
    });
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.errorHistory, null, 2);
  }

  /**
   * Log error with context
   */
  logError(error: AppError): void {
    console.error(
      `[${error.code}] ${error.message}`,
      error.context || {}
    );
  }
}

export const errorHandlingService = new ErrorHandlingService();
