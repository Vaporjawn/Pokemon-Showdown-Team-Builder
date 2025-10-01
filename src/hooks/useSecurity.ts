import { useCallback, useState } from 'react';
import { validators, security } from '../utils/security';
import {
  validatePokemonData,
  validateTeam,
  type ValidatedPokemonData,
  type ValidatedTeam,
  type ValidationResult as TypeValidationResult
} from '../types/validated';

// Hook for form input validation
export function useInputValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    fieldName: string,
    value: string,
    validatorName: keyof typeof validators
  ): boolean => {
    const validator = validators[validatorName];
    const result = validator(value);

    setErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.error || 'Invalid input'
    }));

    return result.isValid;
  }, []);

  const validateMultipleFields = useCallback((
    fields: Array<{ name: string; value: string; validator: keyof typeof validators }>
  ): boolean => {
    const newErrors: Record<string, string> = {};
    let allValid = true;

    fields.forEach(({ name, value, validator }) => {
      const result = validators[validator](value);
      if (!result.isValid) {
        newErrors[name] = result.error || 'Invalid input';
        allValid = false;
      }
    });

    setErrors(newErrors);
    return allValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName] || undefined;
  }, [errors]);

  const hasErrors = useCallback((): boolean => {
    return Object.values(errors).some(error => error !== '');
  }, [errors]);

  return {
    validateField,
    validateMultipleFields,
    clearErrors,
    getFieldError,
    hasErrors,
    errors
  };
}

// Hook for Pokemon data validation
export function usePokemonValidation() {
  const [validationResult, setValidationResult] = useState<TypeValidationResult<ValidatedPokemonData> | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePokemon = useCallback(async (pokemonData: any): Promise<ValidatedPokemonData | null> => {
    setIsValidating(true);

    try {
      const result = validatePokemonData(pokemonData);
      setValidationResult(result);

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      setValidationResult({
        success: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validatePokemon,
    clearValidation,
    validationResult,
    isValidating,
    isValid: validationResult?.success || false,
    errors: validationResult?.errors || []
  };
}

// Hook for team validation
export function useTeamValidation() {
  const [validationResult, setValidationResult] = useState<TypeValidationResult<ValidatedTeam> | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateTeamData = useCallback(async (teamData: any): Promise<ValidatedTeam | null> => {
    setIsValidating(true);

    try {
      const result = validateTeam(teamData);
      setValidationResult(result);

      if (result.success && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      setValidationResult({
        success: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateTeamData,
    clearValidation,
    validationResult,
    isValidating,
    isValid: validationResult?.success || false,
    errors: validationResult?.errors || []
  };
}

// Hook for rate limiting
export function useRateLimit(maxRequests = 100, windowMs = 60000) {
  const [rateLimiter] = useState(() => new security.RateLimiter(maxRequests, windowMs));
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(maxRequests);

  const checkRateLimit = useCallback((identifier: string = 'default'): boolean => {
    const allowed = rateLimiter.checkRateLimit(identifier);
    const remaining = rateLimiter.getRemainingRequests(identifier);

    setIsBlocked(!allowed);
    setRemainingRequests(remaining);

    return allowed;
  }, [rateLimiter]);

  const getRemainingRequests = useCallback((identifier: string = 'default'): number => {
    return rateLimiter.getRemainingRequests(identifier);
  }, [rateLimiter]);

  return {
    checkRateLimit,
    getRemainingRequests,
    isBlocked,
    remainingRequests
  };
}

// Hook for secure data handling
export function useSecureData() {
  const sanitizeInput = useCallback((input: string): string => {
    return security.sanitizeHTML(input);
  }, []);

  const sanitizeObject = useCallback(<T extends Record<string, any>>(
    obj: T,
    allowedFields: (keyof T)[]
  ): Partial<T> => {
    return security.sanitizeExportData(obj, allowedFields);
  }, []);

  const generateId = useCallback((length = 16): string => {
    return security.generateSecureId(length);
  }, []);

  const validateAndSanitize = useCallback((
    input: string,
    validator: keyof typeof validators
  ): { isValid: boolean; sanitized: string; error?: string } => {
    const result = validators[validator](input);
    return {
      isValid: result.isValid,
      sanitized: result.sanitized || sanitizeInput(input),
      error: result.error
    };
  }, [sanitizeInput]);

  return {
    sanitizeInput,
    sanitizeObject,
    generateId,
    validateAndSanitize
  };
}

// Hook for error reporting
export function useErrorReporting() {
  const reportError = useCallback((
    error: Error,
    context?: Record<string, any>
  ): void => {
    security.reportError(error, context);
  }, []);

  const reportValidationError = useCallback((
    validationErrors: string[],
    context?: Record<string, any>
  ): void => {
    const error = new Error(`Validation failed: ${validationErrors.join(', ')}`);
    reportError(error, { ...context, validationErrors });
  }, [reportError]);

  const reportSecurityViolation = useCallback((
    violation: string,
    context?: Record<string, any>
  ): void => {
    const error = new Error(`Security violation: ${violation}`);
    reportError(error, { ...context, securityViolation: true });
  }, [reportError]);

  return {
    reportError,
    reportValidationError,
    reportSecurityViolation
  };
}

// Hook for content security policy
export function useContentSecurity() {
  const [cspViolations, setCspViolations] = useState<string[]>([]);

  const reportCSPViolation = useCallback((violationType: string, details?: string) => {
    const violation = `${violationType}${details ? `: ${details}` : ''}`;
    setCspViolations(prev => [...prev, violation]);

    // Report to error reporting service
    security.reportError(new Error(`CSP Violation: ${violation}`), {
      cspViolation: true,
      violationType,
      details
    });
  }, []);

  const clearViolations = useCallback(() => {
    setCspViolations([]);
  }, []);

  // Listen for CSP violations
  useState(() => {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      reportCSPViolation('Policy Violation', `${event.violatedDirective}: ${event.blockedURI}`);
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  });

  return {
    cspViolations,
    reportCSPViolation,
    clearViolations,
    hasViolations: cspViolations.length > 0
  };
}

// Hook for data export security
export function useSecureExport() {
  const { sanitizeObject } = useSecureData();

  const exportPokemon = useCallback((pokemon: ValidatedPokemonData) => {
    const allowedFields: (keyof ValidatedPokemonData)[] = [
      'name', 'species', 'level', 'ability', 'item', 'nature',
      'gender', 'shiny', 'stats', 'evs', 'ivs', 'moves', 'teraType'
    ];

    return sanitizeObject(pokemon, allowedFields);
  }, [sanitizeObject]);

  const exportTeam = useCallback((team: ValidatedTeam) => {
    const allowedFields: (keyof ValidatedTeam)[] = [
      'name', 'description', 'pokemon', 'format', 'tags'
    ];

    const sanitizedTeam = sanitizeObject(team, allowedFields);

    // Sanitize each Pokemon in the team
    if (sanitizedTeam.pokemon) {
      const sanitizedPokemon = sanitizedTeam.pokemon.map(pokemon =>
        exportPokemon(pokemon)
      ) as ValidatedPokemonData[];

      return {
        ...sanitizedTeam,
        pokemon: sanitizedPokemon
      };
    }

    return sanitizedTeam;
  }, [sanitizeObject, exportPokemon]);

  const createExportData = useCallback((teams: ValidatedTeam[]) => {
    return {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      teams: teams.map(team => exportTeam(team))
    };
  }, [exportTeam]);

  return {
    exportPokemon,
    exportTeam,
    createExportData
  };
}