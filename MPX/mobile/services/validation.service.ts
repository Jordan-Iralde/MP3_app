/**
 * Validation Service
 * Centralized validation utilities for the application
 * Handles Track, Playlist, and User input validation
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

class ValidationService {
  // Email validation
  validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'EMPTY_EMAIL',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // URL validation
  validateUrl(url: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!url) {
      errors.push({
        field: 'url',
        message: 'URL is required',
        code: 'EMPTY_URL',
      });
    } else {
      try {
        new URL(url);
      } catch {
        errors.push({
          field: 'url',
          message: 'Invalid URL format',
          code: 'INVALID_URL',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Track validation
  validateTrack(track: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!track.id) {
      errors.push({
        field: 'id',
        message: 'Track ID is required',
        code: 'MISSING_ID',
      });
    }

    if (!track.title) {
      errors.push({
        field: 'title',
        message: 'Track title is required',
        code: 'MISSING_TITLE',
      });
    }

    if (!track.artist) {
      errors.push({
        field: 'artist',
        message: 'Artist name is required',
        code: 'MISSING_ARTIST',
      });
    }

    // Validate data types
    if (track.duration && typeof track.duration !== 'number') {
      errors.push({
        field: 'duration',
        message: 'Duration must be a number',
        code: 'INVALID_DURATION_TYPE',
      });
    }

    if (track.duration && track.duration < 0) {
      errors.push({
        field: 'duration',
        message: 'Duration must be positive',
        code: 'NEGATIVE_DURATION',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Playlist validation
  validatePlaylist(playlist: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!playlist.id) {
      errors.push({
        field: 'id',
        message: 'Playlist ID is required',
        code: 'MISSING_ID',
      });
    }

    if (!playlist.name) {
      errors.push({
        field: 'name',
        message: 'Playlist name is required',
        code: 'MISSING_NAME',
      });
    }

    if (playlist.name && playlist.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'Playlist name must not exceed 100 characters',
        code: 'NAME_TOO_LONG',
      });
    }

    if (!Array.isArray(playlist.tracks)) {
      errors.push({
        field: 'tracks',
        message: 'Tracks must be an array',
        code: 'INVALID_TRACKS_TYPE',
      });
    } else if (playlist.tracks.length > 10000) {
      errors.push({
        field: 'tracks',
        message: 'Playlist cannot exceed 10,000 tracks',
        code: 'TOO_MANY_TRACKS',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // String validation
  validateString(
    value: string,
    fieldName: string,
    minLength = 1,
    maxLength = 255
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (!value) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'EMPTY_STRING',
      });
    } else if (value.length < minLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${minLength} characters`,
        code: 'STRING_TOO_SHORT',
      });
    } else if (value.length > maxLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${maxLength} characters`,
        code: 'STRING_TOO_LONG',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Number validation
  validateNumber(
    value: number,
    fieldName: string,
    min?: number,
    max?: number
  ): ValidationResult {
    const errors: ValidationError[] = [];

    if (value === null || value === undefined) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'EMPTY_NUMBER',
      });
    } else if (typeof value !== 'number') {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a number`,
        code: 'INVALID_NUMBER_TYPE',
      });
    } else if (min !== undefined && value < min) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${min}`,
        code: 'NUMBER_TOO_SMALL',
      });
    } else if (max !== undefined && value > max) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${max}`,
        code: 'NUMBER_TOO_LARGE',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Batch validation
  validateBatch(
    validations: Array<{ result: ValidationResult; fieldGroup: string }>
  ): ValidationResult {
    const allErrors: ValidationError[] = [];

    for (const { result, fieldGroup } of validations) {
      allErrors.push(...result.errors);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  // Error message formatter
  formatErrors(errors: ValidationError[]): string {
    return errors.map((e) => `${e.field}: ${e.message}`).join('\n');
  }

  // Sanitize user input
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .slice(0, 255); // Limit length
  }
}

export const validationService = new ValidationService();
