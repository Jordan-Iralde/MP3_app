import { validationService } from '@/services/validation.service';

describe('ValidationService', () => {
  describe('Email Validation', () => {
    test('should validate correct email', () => {
      const result = validationService.validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty email', () => {
      const result = validationService.validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('EMPTY_EMAIL');
    });

    test('should reject invalid email format', () => {
      const result = validationService.validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_EMAIL');
    });

    test('should handle email without domain', () => {
      const result = validationService.validateEmail('test@');
      expect(result.valid).toBe(false);
    });
  });

  describe('URL Validation', () => {
    test('should validate correct URL', () => {
      const result = validationService.validateUrl('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty URL', () => {
      const result = validationService.validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_URL');
    });

    test('should reject invalid URL', () => {
      const result = validationService.validateUrl('not a url');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_URL');
    });

    test('should validate URLs with different protocols', () => {
      const httpResult = validationService.validateUrl('http://example.com');
      const ftpResult = validationService.validateUrl('ftp://example.com');

      expect(httpResult.valid).toBe(true);
      expect(ftpResult.valid).toBe(true);
    });
  });

  describe('Track Validation', () => {
    const validTrack = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      duration: 180,
    };

    test('should validate correct track', () => {
      const result = validationService.validateTrack(validTrack);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject track without id', () => {
      const track = { ...validTrack };
      delete track.id;
      const result = validationService.validateTrack(track);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_ID')).toBe(true);
    });

    test('should reject track without title', () => {
      const track = { ...validTrack };
      delete track.title;
      const result = validationService.validateTrack(track);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_TITLE')).toBe(true);
    });

    test('should reject track without artist', () => {
      const track = { ...validTrack };
      delete track.artist;
      const result = validationService.validateTrack(track);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_ARTIST')).toBe(true);
    });

    test('should reject track with negative duration', () => {
      const track = { ...validTrack, duration: -100 };
      const result = validationService.validateTrack(track);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === 'NEGATIVE_DURATION')
      ).toBe(true);
    });

    test('should reject track with non-numeric duration', () => {
      const track = { ...validTrack, duration: 'not a number' };
      const result = validationService.validateTrack(track);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === 'INVALID_DURATION_TYPE')
      ).toBe(true);
    });
  });

  describe('Playlist Validation', () => {
    const validPlaylist = {
      id: '1',
      name: 'Test Playlist',
      tracks: [],
    };

    test('should validate correct playlist', () => {
      const result = validationService.validatePlaylist(validPlaylist);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject playlist without id', () => {
      const playlist = { ...validPlaylist };
      delete playlist.id;
      const result = validationService.validatePlaylist(playlist);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_ID')).toBe(true);
    });

    test('should reject playlist without name', () => {
      const playlist = { ...validPlaylist };
      delete playlist.name;
      const result = validationService.validatePlaylist(playlist);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_NAME')).toBe(true);
    });

    test('should reject playlist with name exceeding max length', () => {
      const playlist = { ...validPlaylist, name: 'a'.repeat(101) };
      const result = validationService.validatePlaylist(playlist);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'NAME_TOO_LONG')).toBe(true);
    });

    test('should reject playlist with non-array tracks', () => {
      const playlist = { ...validPlaylist, tracks: 'not an array' };
      const result = validationService.validatePlaylist(playlist);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.code === 'INVALID_TRACKS_TYPE')
      ).toBe(true);
    });

    test('should reject playlist with too many tracks', () => {
      const playlist = {
        ...validPlaylist,
        tracks: Array(10001).fill({}),
      };
      const result = validationService.validatePlaylist(playlist);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'TOO_MANY_TRACKS')).toBe(
        true
      );
    });
  });

  describe('String Validation', () => {
    test('should validate valid string', () => {
      const result = validationService.validateString('valid string', 'test');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty string', () => {
      const result = validationService.validateString('', 'test');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_STRING');
    });

    test('should reject string shorter than minLength', () => {
      const result = validationService.validateString(
        'ab',
        'test',
        5,
        255
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('STRING_TOO_SHORT');
    });

    test('should reject string longer than maxLength', () => {
      const result = validationService.validateString(
        'a'.repeat(300),
        'test',
        1,
        255
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('STRING_TOO_LONG');
    });
  });

  describe('Number Validation', () => {
    test('should validate valid number', () => {
      const result = validationService.validateNumber(42, 'test');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null number', () => {
      const result = validationService.validateNumber(null as any, 'test');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_NUMBER');
    });

    test('should reject non-numeric value', () => {
      const result = validationService.validateNumber(
        'not a number' as any,
        'test'
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_NUMBER_TYPE');
    });

    test('should reject number below minimum', () => {
      const result = validationService.validateNumber(5, 'test', 10, 100);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('NUMBER_TOO_SMALL');
    });

    test('should reject number above maximum', () => {
      const result = validationService.validateNumber(150, 'test', 10, 100);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('NUMBER_TOO_LARGE');
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple validations', () => {
      const validations = [
        {
          result: validationService.validateEmail('test@example.com'),
          fieldGroup: 'contact',
        },
        {
          result: validationService.validateString('valid name', 'name'),
          fieldGroup: 'personal',
        },
      ];

      const result = validationService.validateBatch(validations);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should collect all errors', () => {
      const validations = [
        {
          result: validationService.validateEmail('invalid'),
          fieldGroup: 'contact',
        },
        {
          result: validationService.validateString('', 'name'),
          fieldGroup: 'personal',
        },
      ];

      const result = validationService.validateBatch(validations);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('String Sanitization', () => {
    test('should sanitize HTML tags', () => {
      const result = validationService.sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('should trim whitespace', () => {
      const result = validationService.sanitizeString('  test  ');
      expect(result).toBe('test');
    });

    test('should limit string length', () => {
      const longString = 'a'.repeat(300);
      const result = validationService.sanitizeString(longString);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('Error Message Formatting', () => {
    test('should format errors correctly', () => {
      const errors = [
        { field: 'email', message: 'Invalid email', code: 'INVALID' },
        { field: 'password', message: 'Password too short', code: 'SHORT' },
      ];

      const formatted = validationService.formatErrors(errors);
      expect(formatted).toContain('email: Invalid email');
      expect(formatted).toContain('password: Password too short');
    });
  });
});
