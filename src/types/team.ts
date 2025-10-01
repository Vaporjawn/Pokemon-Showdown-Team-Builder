// Team builder specific types

export interface TeamPokemon {
  id?: string; // Unique ID for team slot
  species?: string; // Pokemon species name
  nickname?: string;
  level: number;
  gender?: 'M' | 'F' | 'N'; // Male, Female, Neutral
  shiny: boolean;
  ability?: string;
  nature?: string;
  item?: string;
  moves: (string | null)[]; // Array of 4 moves, can be null
  evs: StatSpread;
  ivs: StatSpread;
  happiness: number;
  pokeball?: string;
  // Additional metadata
  form?: string; // For alternate forms like Rotom-Wash
}

export interface StatSpread {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface Team {
  id?: string;
  name: string;
  format?: string;
  generation: number;
  pokemon: (TeamPokemon | null)[]; // Array of 6 slots
  created_at?: Date;
  updated_at?: Date;
}

export interface TeamAnalysis {
  typeWeaknesses: TypeEffectiveness[];
  typeResistances: TypeEffectiveness[];
  typeImmunities: TypeEffectiveness[];
  moveCoverage: TypeCoverage[];
  suggestions: string[];
}

export interface TypeEffectiveness {
  type: string;
  multiplier: number;
  count: number; // How many Pokemon are affected
}

export interface TypeCoverage {
  type: string;
  moves: string[];
  pokemon: string[];
}

// Random generator settings
export interface RandomGeneratorSettings {
  generation: number;
  format: string;
  mode: 'competitive' | 'chaos';
  allowLegendaries: boolean;
  allowUnevolved: boolean;
  forceFullyEvolved: boolean;
  customSettings?: {
    allowedTiers?: string[];
    bannedPokemon?: string[];
    preferredTypes?: string[];
  };
}

// Import/Export formats
export interface ShowdownImportResult {
  success: boolean;
  team?: Team;
  errors: string[];
  warnings: string[];
}

export interface JSONExportData {
  version: string;
  exportedAt: Date;
  team: Team;
  metadata?: {
    appVersion: string;
    formatVersion: string;
  };
}

// Generation specific data
export interface GenerationData {
  id: number;
  name: string;
  displayName: string;
  pokemon: NamedResource[];
  moves: NamedResource[];
  abilities: NamedResource[];
  items: NamedResource[];
  types: NamedResource[];
  mechanics: {
    hasAbilities: boolean;
    hasNatures: boolean;
    hasGenders: boolean;
    hasHeldItems: boolean;
    physicalSpecialSplit: boolean;
    maxLevel: number;
    maxEvTotal: number;
    maxEvPerStat: number;
    maxIvPerStat: number;
  };
}

export interface NamedResource {
  name: string;
  displayName: string;
  id: number;
}

// UI State types
export interface AppState {
  currentTeam: Team;
  selectedPokemonSlot: number;
  generation: number;
  format: string;
  isLoading: boolean;
  error?: string;
}

export interface PokemonEditorState {
  isEditing: boolean;
  currentField?: string;
  unsavedChanges: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Data cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface DataCache {
  pokemon: Map<string, CacheEntry<unknown>>;
  species: Map<string, CacheEntry<unknown>>;
  moves: Map<string, CacheEntry<unknown>>;
  abilities: Map<string, CacheEntry<unknown>>;
  items: Map<string, CacheEntry<unknown>>;
  types: Map<string, CacheEntry<unknown>>;
  natures: Map<string, CacheEntry<unknown>>;
  generations: Map<number, CacheEntry<GenerationData>>;
}

// API response wrappers
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Format and tier data
export interface CompetitiveFormat {
  id: string;
  name: string;
  generation: number;
  rules: FormatRule[];
  bannedPokemon: string[];
  bannedMoves: string[];
  bannedAbilities: string[];
  bannedItems: string[];
  customRules?: string[];
}

export interface FormatRule {
  id: string;
  description: string;
  type: 'ban' | 'restriction' | 'clause';
}

// Move legality checking
export interface MoveLearnset {
  pokemon: string;
  generation: number;
  moves: LearnableMove[];
}

export interface LearnableMove {
  move: string;
  learnMethods: LearnMethod[];
  generations: number[];
}

export interface LearnMethod {
  method: 'level-up' | 'tm' | 'hm' | 'tutor' | 'egg' | 'special';
  level?: number;
  tm?: string;
  requirement?: string;
}

// Type chart data
export interface TypeChart {
  generation: number;
  effectiveness: Map<string, Map<string, number>>;
}

// Usage stats and recommendations
export interface UsageStats {
  pokemon: string;
  generation: number;
  format: string;
  usage: number;
  abilities: { [key: string]: number };
  items: { [key: string]: number };
  moves: { [key: string]: number };
  natures: { [key: string]: number };
  evSpreads: { [key: string]: number };
}

export interface PokemonRecommendation {
  pokemon: string;
  reason: string;
  confidence: number;
  suggestedSet?: Partial<TeamPokemon>;
}
