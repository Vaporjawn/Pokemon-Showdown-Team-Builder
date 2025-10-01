/**
 * Types for fallback data structure - simplified versions of the API types
 * These are used when the API is unavailable or for initial data loading
 * Note: These match our actual fallback JSON data structure
 */

export interface FallbackPokemon {
  name: string;
  id: number;
  base_experience?: number;
  height?: number;
  weight?: number;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
    };
  }>;
  abilities?: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites?: {
    front_default?: string;
    front_shiny?: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
      };
    };
  };
}

export interface FallbackMove {
  name: string;
  id: number;
  type: {
    name: string;
  };
  power?: number;
  accuracy?: number;
  pp: number;
  priority?: number;
  damage_class: {
    name: string;
  };
  effect_entries?: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
}

export interface FallbackItem {
  name: string;
  id: number;
  category?: {
    name: string;
  };
  effect_entries?: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
  sprites?: {
    default?: string;
  };
}

export interface FallbackAbility {
  name: string;
  id: number;
  effect_entries?: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
}

export interface FallbackNature {
  name: string;
  increased_stat?: string | null;
  decreased_stat?: string | null;
}

export interface FallbackData {
  pokemon: Record<string, FallbackPokemon>;
  moves: FallbackMove[];
  items: FallbackItem[];
  abilities: FallbackAbility[];
  natures: FallbackNature[];
}
