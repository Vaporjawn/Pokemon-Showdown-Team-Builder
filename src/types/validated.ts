/**
 * Enhanced type definitions with strict validation
 * Provides comprehensive type safety for the Pokemon Team Builder
 */

// Base types with validation
export interface ValidatedString {
  readonly value: string;
  readonly isValid: boolean;
  readonly error?: string;
}

export interface ValidatedNumber {
  readonly value: number;
  readonly isValid: boolean;
  readonly error?: string;
}

// Pokemon stat range validation
export type PokemonStatValue = number & { readonly __brand: 'PokemonStat' };
export type PokemonLevel = number & { readonly __brand: 'PokemonLevel' };
export type PokemonId = string & { readonly __brand: 'PokemonId' };
export type TeamId = string & { readonly __brand: 'TeamId' };

// Create branded types with validation
export function createPokemonStat(value: number): PokemonStatValue | null {
  if (value >= 0 && value <= 255 && Number.isInteger(value)) {
    return value as PokemonStatValue;
  }
  return null;
}

export function createPokemonLevel(value: number): PokemonLevel | null {
  if (value >= 1 && value <= 100 && Number.isInteger(value)) {
    return value as PokemonLevel;
  }
  return null;
}

export function createPokemonId(value: string): PokemonId | null {
  if (value && /^[a-z0-9\-]+$/.test(value) && value.length <= 50) {
    return value as PokemonId;
  }
  return null;
}

export function createTeamId(value: string): TeamId | null {
  if (value && /^[a-zA-Z0-9\-_]+$/.test(value) && value.length <= 50) {
    return value as TeamId;
  }
  return null;
}

// Enhanced Pokemon type with strict validation
export interface ValidatedPokemonData {
  readonly id: PokemonId;
  readonly name: string;
  readonly species: string;
  readonly level: PokemonLevel;
  readonly ability: string;
  readonly item?: string;
  readonly nature: string;
  readonly gender?: 'M' | 'F' | 'N';
  readonly shiny: boolean;
  readonly stats: {
    readonly hp: PokemonStatValue;
    readonly attack: PokemonStatValue;
    readonly defense: PokemonStatValue;
    readonly specialAttack: PokemonStatValue;
    readonly specialDefense: PokemonStatValue;
    readonly speed: PokemonStatValue;
  };
  readonly evs: {
    readonly hp: PokemonStatValue;
    readonly attack: PokemonStatValue;
    readonly defense: PokemonStatValue;
    readonly specialAttack: PokemonStatValue;
    readonly specialDefense: PokemonStatValue;
    readonly speed: PokemonStatValue;
  };
  readonly ivs: {
    readonly hp: PokemonStatValue;
    readonly attack: PokemonStatValue;
    readonly defense: PokemonStatValue;
    readonly specialAttack: PokemonStatValue;
    readonly specialDefense: PokemonStatValue;
    readonly speed: PokemonStatValue;
  };
  readonly moves: readonly [string, string, string?, string?]; // At least 2 moves, up to 4
  readonly teraType?: string;
  readonly validatedAt: Date;
}

// Enhanced Team type with validation
export interface ValidatedTeam {
  readonly id: TeamId;
  readonly name: string;
  readonly description?: string;
  readonly pokemon: readonly ValidatedPokemonData[]; // 1-6 Pokemon
  readonly format: 'Singles' | 'Doubles' | 'VGC' | 'Other';
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly validatedAt: Date;
  readonly isPublic: boolean;
  readonly tags: readonly string[];
}

// Type validation results
export interface ValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors: readonly string[];
}

// Move validation
export interface ValidatedMove {
  readonly name: string;
  readonly type: string;
  readonly category: 'Physical' | 'Special' | 'Status';
  readonly power?: number;
  readonly accuracy?: number;
  readonly pp: number;
  readonly description: string;
  readonly validatedAt: Date;
}

// Ability validation
export interface ValidatedAbility {
  readonly name: string;
  readonly description: string;
  readonly shortDescription?: string;
  readonly validatedAt: Date;
}

// Item validation
export interface ValidatedItem {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly validatedAt: Date;
}

// Type Guards
export function isPokemonData(data: any): data is ValidatedPokemonData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.species === 'string' &&
    typeof data.level === 'number' &&
    data.level >= 1 &&
    data.level <= 100 &&
    typeof data.ability === 'string' &&
    typeof data.nature === 'string' &&
    typeof data.shiny === 'boolean' &&
    data.stats &&
    data.evs &&
    data.ivs &&
    Array.isArray(data.moves) &&
    data.moves.length >= 1 &&
    data.moves.length <= 4 &&
    data.validatedAt instanceof Date
  );
}

export function isValidTeam(data: any): data is ValidatedTeam {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.pokemon) &&
    data.pokemon.length >= 1 &&
    data.pokemon.length <= 6 &&
    data.pokemon.every(isPokemonData) &&
    ['Singles', 'Doubles', 'VGC', 'Other'].includes(data.format) &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date &&
    data.validatedAt instanceof Date &&
    typeof data.isPublic === 'boolean' &&
    Array.isArray(data.tags)
  );
}

// Validation functions
export function validatePokemonData(data: any): ValidationResult<ValidatedPokemonData> {
  const errors: string[] = [];

  // Validate required fields
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Pokemon name is required and must be a string');
  }

  if (!data.species || typeof data.species !== 'string') {
    errors.push('Pokemon species is required and must be a string');
  }

  const level = createPokemonLevel(data.level);
  if (!level) {
    errors.push('Pokemon level must be between 1 and 100');
  }

  if (!data.ability || typeof data.ability !== 'string') {
    errors.push('Pokemon ability is required and must be a string');
  }

  if (!data.nature || typeof data.nature !== 'string') {
    errors.push('Pokemon nature is required and must be a string');
  }

  // Validate stats
  const validateStatSet = (statSet: any, setName: string) => {
    if (!statSet || typeof statSet !== 'object') {
      errors.push(`${setName} must be an object`);
      return;
    }

    const requiredStats = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    for (const stat of requiredStats) {
      const value = createPokemonStat(statSet[stat]);
      if (value === null) {
        errors.push(`${setName}.${stat} must be between 0 and 255`);
      }
    }
  };

  validateStatSet(data.stats, 'Stats');
  validateStatSet(data.evs, 'EVs');
  validateStatSet(data.ivs, 'IVs');

  // Validate moves
  if (!Array.isArray(data.moves)) {
    errors.push('Moves must be an array');
  } else {
    if (data.moves.length < 1 || data.moves.length > 4) {
      errors.push('Pokemon must have between 1 and 4 moves');
    }

    data.moves.forEach((move: any, index: number) => {
      if (!move || typeof move !== 'string') {
        errors.push(`Move ${index + 1} must be a string`);
      }
    });
  }

  // Validate optional fields
  if (data.gender && !['M', 'F', 'N'].includes(data.gender)) {
    errors.push('Gender must be M, F, or N');
  }

  if (data.shiny !== undefined && typeof data.shiny !== 'boolean') {
    errors.push('Shiny must be a boolean');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Create validated Pokemon data
  const validatedData: ValidatedPokemonData = {
    id: createPokemonId(data.id || data.name.toLowerCase().replace(/\s+/g, '-'))!,
    name: data.name,
    species: data.species,
    level: level!,
    ability: data.ability,
    item: data.item || undefined,
    nature: data.nature,
    gender: data.gender || undefined,
    shiny: data.shiny || false,
    stats: {
      hp: createPokemonStat(data.stats.hp)!,
      attack: createPokemonStat(data.stats.attack)!,
      defense: createPokemonStat(data.stats.defense)!,
      specialAttack: createPokemonStat(data.stats.specialAttack)!,
      specialDefense: createPokemonStat(data.stats.specialDefense)!,
      speed: createPokemonStat(data.stats.speed)!,
    },
    evs: {
      hp: createPokemonStat(data.evs.hp)!,
      attack: createPokemonStat(data.evs.attack)!,
      defense: createPokemonStat(data.evs.defense)!,
      specialAttack: createPokemonStat(data.evs.specialAttack)!,
      specialDefense: createPokemonStat(data.evs.specialDefense)!,
      speed: createPokemonStat(data.evs.speed)!,
    },
    ivs: {
      hp: createPokemonStat(data.ivs.hp)!,
      attack: createPokemonStat(data.ivs.attack)!,
      defense: createPokemonStat(data.ivs.defense)!,
      specialAttack: createPokemonStat(data.ivs.specialAttack)!,
      specialDefense: createPokemonStat(data.ivs.specialDefense)!,
      speed: createPokemonStat(data.ivs.speed)!,
    },
    moves: data.moves as [string, string, string?, string?],
    teraType: data.teraType || undefined,
    validatedAt: new Date()
  };

  return { success: true, data: validatedData, errors: [] };
}

export function validateTeam(data: any): ValidationResult<ValidatedTeam> {
  const errors: string[] = [];

  // Validate basic fields
  if (!data.name || typeof data.name !== 'string' || data.name.length > 100) {
    errors.push('Team name is required and must be 100 characters or less');
  }

  if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) {
    errors.push('Team description must be 500 characters or less');
  }

  if (!['Singles', 'Doubles', 'VGC', 'Other'].includes(data.format)) {
    errors.push('Team format must be Singles, Doubles, VGC, or Other');
  }

  // Validate Pokemon array
  if (!Array.isArray(data.pokemon)) {
    errors.push('Pokemon must be an array');
  } else {
    if (data.pokemon.length < 1 || data.pokemon.length > 6) {
      errors.push('Team must have between 1 and 6 Pokemon');
    }

    const pokemonErrors: string[] = [];
    const validatedPokemon: ValidatedPokemonData[] = [];

    data.pokemon.forEach((pokemon: any, index: number) => {
      const result = validatePokemonData(pokemon);
      if (!result.success) {
        pokemonErrors.push(`Pokemon ${index + 1}: ${result.errors.join(', ')}`);
      } else if (result.data) {
        validatedPokemon.push(result.data);
      }
    });

    errors.push(...pokemonErrors);
  }

  // Validate optional fields
  if (data.isPublic !== undefined && typeof data.isPublic !== 'boolean') {
    errors.push('isPublic must be a boolean');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  } else if (data.tags) {
    data.tags.forEach((tag: any, index: number) => {
      if (typeof tag !== 'string' || tag.length > 30) {
        errors.push(`Tag ${index + 1} must be a string of 30 characters or less`);
      }
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Create validated team
  const teamId = createTeamId(data.id || `team-${Date.now()}`);
  if (!teamId) {
    return { success: false, errors: ['Invalid team ID format'] };
  }

  const validatedTeam: ValidatedTeam = {
    id: teamId,
    name: data.name,
    description: data.description || undefined,
    pokemon: data.pokemon.map((p: any) => validatePokemonData(p).data!),
    format: data.format,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: new Date(),
    validatedAt: new Date(),
    isPublic: data.isPublic || false,
    tags: data.tags || []
  };

  return { success: true, data: validatedTeam, errors: [] };
}

// Serialization with validation
export function serializeTeam(team: ValidatedTeam): string {
  try {
    return JSON.stringify({
      ...team,
      // Convert dates to ISO strings for serialization
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      validatedAt: team.validatedAt.toISOString(),
      pokemon: team.pokemon.map(p => ({
        ...p,
        validatedAt: p.validatedAt.toISOString()
      }))
    });
  } catch (error) {
    throw new Error(`Failed to serialize team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function deserializeTeam(data: string): ValidationResult<ValidatedTeam> {
  try {
    const parsed = JSON.parse(data);

    // Convert ISO strings back to dates
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
    if (parsed.validatedAt) parsed.validatedAt = new Date(parsed.validatedAt);

    if (parsed.pokemon) {
      parsed.pokemon = parsed.pokemon.map((p: any) => ({
        ...p,
        validatedAt: p.validatedAt ? new Date(p.validatedAt) : new Date()
      }));
    }

    return validateTeam(parsed);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to deserialize team: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Export utility functions
export const typeUtils = {
  createPokemonStat,
  createPokemonLevel,
  createPokemonId,
  createTeamId,
  isPokemonData,
  isValidTeam,
  validatePokemonData,
  validateTeam,
  serializeTeam,
  deserializeTeam
};