import { useState, useCallback } from 'react';
import {
  validationService,
  ValidationResult,
  ValidationError,
} from '@/services/validation.service';

/**
 * Hook for form validation
 * Provides validation state and methods for common validation tasks
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (fieldName: string, value: any, validationType: string): boolean => {
      let result: ValidationResult;

      switch (validationType) {
        case 'email':
          result = validationService.validateEmail(value);
          break;
        case 'url':
          result = validationService.validateUrl(value);
          break;
        case 'string':
          result = validationService.validateString(value, fieldName);
          break;
        default:
          result = { valid: true, errors: [] };
      }

      if (result.valid) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: result.errors[0]?.message || 'Invalid input',
        }));
      }

      return result.valid;
    },
    []
  );

  const validateForm = useCallback(
    (
      values: Record<string, any>,
      schema: Record<string, string>
    ): Record<string, string> => {
      const formErrors: Record<string, string> = {};

      Object.entries(schema).forEach(([fieldName, validationType]) => {
        const value = values[fieldName];
        let result: ValidationResult;

        switch (validationType) {
          case 'email':
            result = validationService.validateEmail(value);
            break;
          case 'url':
            result = validationService.validateUrl(value);
            break;
          case 'string':
            result = validationService.validateString(value, fieldName);
            break;
          default:
            result = { valid: true, errors: [] };
        }

        if (!result.valid && result.errors.length > 0) {
          formErrors[fieldName] = result.errors[0].message;
        }
      });

      setErrors(formErrors);
      return formErrors;
    },
    []
  );

  const setFieldTouched = useCallback((fieldName: string, value = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearTouched = useCallback(() => {
    setTouched({});
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return touched[fieldName] ? errors[fieldName] : undefined;
    },
    [errors, touched]
  );

  const isFieldValid = useCallback(
    (fieldName: string): boolean => {
      return !errors[fieldName];
    },
    [errors]
  );

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    clearTouched,
    getFieldError,
    isFieldValid,
    hasErrors: Object.keys(errors).length > 0,
  };
}

/**
 * Hook for validating tracks
 */
export function useTrackValidation() {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const validateTrack = useCallback((track: any) => {
    const result = validationService.validateTrack(track);
    setValidationResult(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    validateTrack,
    clearValidation,
    isValid: validationResult?.valid ?? true,
    errors: validationResult?.errors ?? [],
  };
}

/**
 * Hook for validating playlists
 */
export function usePlaylistValidation() {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const validatePlaylist = useCallback((playlist: any) => {
    const result = validationService.validatePlaylist(playlist);
    setValidationResult(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    validatePlaylist,
    clearValidation,
    isValid: validationResult?.valid ?? true,
    errors: validationResult?.errors ?? [],
  };
}

/**
 * Hook for sanitizing user input
 */
export function useSanitizedInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const sanitize = useCallback((input: string) => {
    const sanitized = validationService.sanitizeString(input);
    setValue(sanitized);
    return sanitized;
  }, []);

  const handleChange = useCallback((text: string) => {
    sanitize(text);
  }, [sanitize]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    setValue,
    sanitize,
    handleChange,
    reset,
  };
}
