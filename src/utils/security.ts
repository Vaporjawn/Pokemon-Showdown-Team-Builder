/**
 * Input validation and sanitization utilities
 * Provides comprehensive protection against XSS, injection attacks, and malformed data
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  // Pokemon names (allow letters, spaces, hyphens, apostrophes, and periods)
  POKEMON_NAME: /^[a-zA-Z\s\-'.]+$/,

  // Team names (alphanumeric, spaces, hyphens, underscores)
  TEAM_NAME: /^[a-zA-Z0-9\s\-_]+$/,

  // Move names (allow letters, spaces, hyphens, and parentheses)
  MOVE_NAME: /^[a-zA-Z\s\-()]+$/,

  // Ability names (allow letters, spaces, and hyphens)
  ABILITY_NAME: /^[a-zA-Z\s\-]+$/,

  // Item names (allow letters, numbers, spaces, hyphens, apostrophes)
  ITEM_NAME: /^[a-zA-Z0-9\s\-'.]+$/,

  // URLs (basic URL validation)
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  // Hex colors
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  // Numbers (positive integers)
  POSITIVE_INTEGER: /^\d+$/,

  // Pokemon stats (0-255)
  POKEMON_STAT: /^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/,

  // Pokemon level (1-100)
  POKEMON_LEVEL: /^([1-9]|[1-9][0-9]|100)$/,

  // Version strings
  VERSION: /^[0-9]+\.[0-9]+\.[0-9]+$/,
} as const;

// Input length limits
export const INPUT_LIMITS = {
  POKEMON_NAME: 50,
  TEAM_NAME: 100,
  MOVE_NAME: 50,
  ABILITY_NAME: 50,
  ITEM_NAME: 50,
  DESCRIPTION: 500,
  NOTES: 1000,
  URL: 2000,
  SEARCH_QUERY: 100,
  TAG: 30,
} as const;

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

// HTML sanitization for user inputs
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Generic input validator
export function validateInput(
  input: string,
  pattern: RegExp,
  maxLength: number,
  fieldName: string,
  required = true
): ValidationResult {
  // Check if required
  if (required && (!input || input.trim().length === 0)) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }

  // If not required and empty, return valid
  if (!required && (!input || input.trim().length === 0)) {
    return {
      isValid: true,
      sanitized: ''
    };
  }

  const trimmedInput = input.trim();

  // Check length
  if (trimmedInput.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less`
    };
  }

  // Check pattern
  if (!pattern.test(trimmedInput)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters`
    };
  }

  // Sanitize and return
  return {
    isValid: true,
    sanitized: sanitizeHTML(trimmedInput)
  };
}

// Specific validators
export const validators = {
  pokemonName: (name: string): ValidationResult =>
    validateInput(name, VALIDATION_PATTERNS.POKEMON_NAME, INPUT_LIMITS.POKEMON_NAME, 'Pokemon name'),

  teamName: (name: string): ValidationResult =>
    validateInput(name, VALIDATION_PATTERNS.TEAM_NAME, INPUT_LIMITS.TEAM_NAME, 'Team name'),

  moveName: (name: string): ValidationResult =>
    validateInput(name, VALIDATION_PATTERNS.MOVE_NAME, INPUT_LIMITS.MOVE_NAME, 'Move name'),

  abilityName: (name: string): ValidationResult =>
    validateInput(name, VALIDATION_PATTERNS.ABILITY_NAME, INPUT_LIMITS.ABILITY_NAME, 'Ability name'),

  itemName: (name: string): ValidationResult =>
    validateInput(name, VALIDATION_PATTERNS.ITEM_NAME, INPUT_LIMITS.ITEM_NAME, 'Item name'),

  url: (url: string, required = false): ValidationResult =>
    validateInput(url, VALIDATION_PATTERNS.URL, INPUT_LIMITS.URL, 'URL', required),

  hexColor: (color: string): ValidationResult =>
    validateInput(color, VALIDATION_PATTERNS.HEX_COLOR, 7, 'Color'),

  pokemonStat: (stat: string): ValidationResult => {
    const result = validateInput(stat, VALIDATION_PATTERNS.POKEMON_STAT, 3, 'Pokemon stat');
    if (result.isValid) {
      const numericValue = parseInt(stat, 10);
      if (numericValue < 0 || numericValue > 255) {
        return {
          isValid: false,
          error: 'Pokemon stat must be between 0 and 255'
        };
      }
    }
    return result;
  },

  pokemonLevel: (level: string): ValidationResult => {
    const result = validateInput(level, VALIDATION_PATTERNS.POKEMON_LEVEL, 3, 'Pokemon level');
    if (result.isValid) {
      const numericValue = parseInt(level, 10);
      if (numericValue < 1 || numericValue > 100) {
        return {
          isValid: false,
          error: 'Pokemon level must be between 1 and 100'
        };
      }
    }
    return result;
  },

  searchQuery: (query: string): ValidationResult =>
    validateInput(query, /^[a-zA-Z0-9\s\-_'.]+$/, INPUT_LIMITS.SEARCH_QUERY, 'Search query', false),

  description: (description: string): ValidationResult =>
    validateInput(description, /^[\w\s\-_'.,!?()]+$/, INPUT_LIMITS.DESCRIPTION, 'Description', false),

  notes: (notes: string): ValidationResult =>
    validateInput(notes, /^[\w\s\-_'.,!?()\/\n\r]+$/, INPUT_LIMITS.NOTES, 'Notes', false)
};

// Array validation
export function validateArray<T>(
  array: T[],
  maxLength: number,
  validator?: (item: T) => ValidationResult,
  fieldName = 'Array'
): ValidationResult {
  if (array.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain more than ${maxLength} items`
    };
  }

  if (validator) {
    for (let i = 0; i < array.length; i++) {
      const result = validator(array[i]);
      if (!result.isValid) {
        return {
          isValid: false,
          error: `${fieldName} item ${i + 1}: ${result.error}`
        };
      }
    }
  }

  return { isValid: true };
}

// Object validation
export function validateObject(
  obj: Record<string, any>,
  schema: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [key, validator] of Object.entries(schema)) {
    if (obj.hasOwnProperty(key)) {
      const result = validator(obj[key]);
      if (!result.isValid && result.error) {
        errors[key] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

// Pokemon data validation schema
export const pokemonDataSchema = {
  name: validators.pokemonName,
  species: validators.pokemonName,
  level: (level: number) => validators.pokemonLevel(level.toString()),
  ability: validators.abilityName,
  item: (item: string) => item ? validators.itemName(item) : { isValid: true },
  moves: (moves: string[]) => {
    const arrayResult = validateArray(moves, 4, (move) => validators.moveName(move), 'Moves');
    if (!arrayResult.isValid) return arrayResult;
    if (moves.length === 0) {
      return { isValid: false, error: 'Pokemon must have at least one move' };
    }
    return { isValid: true };
  },
  stats: (stats: Record<string, number>) => {
    const requiredStats = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    for (const stat of requiredStats) {
      if (!stats.hasOwnProperty(stat)) {
        return { isValid: false, error: `Missing required stat: ${stat}` };
      }
      const result = validators.pokemonStat(stats[stat].toString());
      if (!result.isValid) {
        return { isValid: false, error: `Invalid ${stat}: ${result.error}` };
      }
    }
    return { isValid: true };
  }
};

// Team validation schema
export const teamSchema = {
  name: validators.teamName,
  description: validators.description,
  pokemon: (pokemon: any[]) => {
    const arrayResult = validateArray(pokemon, 6, undefined, 'Team');
    if (!arrayResult.isValid) return arrayResult;
    if (pokemon.length === 0) {
      return { isValid: false, error: 'Team must have at least one Pokemon' };
    }

    // Validate each Pokemon
    for (let i = 0; i < pokemon.length; i++) {
      const pokemonResult = validateObject(pokemon[i], pokemonDataSchema);
      if (!pokemonResult.isValid) {
        const firstError = Object.values(pokemonResult.errors)[0];
        return { isValid: false, error: `Pokemon ${i + 1}: ${firstError}` };
      }
    }

    return { isValid: true };
  }
};

// Content Security Policy utilities
export function createCSPHeader(): string {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: In production, remove unsafe-inline and unsafe-eval
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://pokeapi.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  return cspDirectives.join('; ');
}

// Rate limiting utilities
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) { // 100 requests per minute by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let requestTimes = this.requests.get(identifier) || [];

    // Remove requests outside the current window
    requestTimes = requestTimes.filter(time => time > windowStart);

    // Check if under rate limit
    if (requestTimes.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    requestTimes.push(now);
    this.requests.set(identifier, requestTimes);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestTimes = this.requests.get(identifier) || [];
    const validRequests = requestTimes.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Error reporting utility
export function reportError(error: Error, context?: Record<string, any>): void {
  // In production, this would send to an error reporting service
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context
  });

  // For development, also show user-friendly message
  if (process.env.NODE_ENV === 'development') {
    console.warn('Development Error Details:', error);
  }
}

// Secure random ID generation
export function generateSecureId(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Data export sanitization
export function sanitizeExportData<T extends Record<string, any>>(
  data: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};

  allowedFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      const value = data[field];
      if (typeof value === 'string') {
        sanitized[field] = sanitizeHTML(value) as T[keyof T];
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize objects (shallow for now)
        sanitized[field] = value;
      } else {
        sanitized[field] = value;
      }
    }
  });

  return sanitized;
}

// Initialize security headers (for development awareness)
export function initializeSecurity(): void {
  // Add CSP meta tag if not present
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = createCSPHeader();
    document.head.appendChild(meta);
  }

  // Add security headers awareness
  console.info('Security initialized. Remember to set proper headers on the server:');
  console.info('- Content-Security-Policy');
  console.info('- X-Content-Type-Options: nosniff');
  console.info('- X-Frame-Options: DENY');
  console.info('- X-XSS-Protection: 1; mode=block');
  console.info('- Strict-Transport-Security (HTTPS only)');
  console.info('- Referrer-Policy: strict-origin-when-cross-origin');
}

// Export utilities
export const security = {
  validators,
  validateArray,
  validateObject,
  pokemonDataSchema,
  teamSchema,
  sanitizeHTML,
  sanitizeExportData,
  generateSecureId,
  reportError,
  RateLimiter,
  initializeSecurity
};