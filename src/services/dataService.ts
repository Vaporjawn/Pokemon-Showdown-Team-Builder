import type { Pokemon, Move, Ability, Item, Nature } from '../types/pokemon';
import type {
  FallbackData,
  FallbackMove,
  FallbackItem,
  FallbackAbility,
  FallbackNature
} from '../types/fallback';
import fallbackData from '../data/fallback-pokemon-data.json';

// API endpoints
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Enhanced Pokemon data service that combines PokéAPI with local fallback data
 * Provides offline functionality and faster initial load times
 */
export class PokemonDataService {
  private cache = new Map<string, unknown>();
  private fallback = fallbackData as FallbackData;

  /**
   * Get Pokemon data - tries API first, falls back to local data
   */
  async getPokemon(pokemonName: string): Promise<Pokemon | null> {
    const cacheKey = `pokemon-${pokemonName.toLowerCase()}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Pokemon;
    }

    try {
      // Try API first
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonName.toLowerCase()}`);
      if (response.ok) {
        const pokemon = await response.json() as Pokemon;
        this.cache.set(cacheKey, pokemon);
        return pokemon;
      }
    } catch (error) {
      console.warn(`API call failed for ${pokemonName}, using fallback data:`, error);
    }

    // Fall back to local data
    const fallbackPokemon = this.fallback.pokemon[pokemonName.toLowerCase()];
    if (fallbackPokemon) {
      this.cache.set(cacheKey, fallbackPokemon);
      return fallbackPokemon as unknown as Pokemon;
    }

    return null;
  }

  /**
   * Get move data - tries API first, falls back to local data
   */
  async getMove(moveName: string): Promise<Move | null> {
    const cacheKey = `move-${moveName.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Move;
    }

    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/move/${moveName.toLowerCase()}`);
      if (response.ok) {
        const move = await response.json() as Move;
        this.cache.set(cacheKey, move);
        return move;
      }
    } catch (error) {
      console.warn(`API call failed for move ${moveName}, using fallback data:`, error);
    }

    // Fall back to local data
    const fallbackMove = this.fallback.moves.find((m: FallbackMove) => m.name === moveName.toLowerCase());
    if (fallbackMove) {
      this.cache.set(cacheKey, fallbackMove);
      return fallbackMove as unknown as Move;
    }

    return null;
  }

  /**
   * Get item data - tries API first, falls back to local data
   */
  async getItem(itemName: string): Promise<Item | null> {
    const cacheKey = `item-${itemName.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Item;
    }

    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/item/${itemName.toLowerCase()}`);
      if (response.ok) {
        const item = await response.json() as Item;
        this.cache.set(cacheKey, item);
        return item;
      }
    } catch (error) {
      console.warn(`API call failed for item ${itemName}, using fallback data:`, error);
    }

    // Fall back to local data
    const fallbackItem = this.fallback.items.find((i: FallbackItem) => i.name === itemName.toLowerCase());
    if (fallbackItem) {
      this.cache.set(cacheKey, fallbackItem);
      return fallbackItem as unknown as Item;
    }

    return null;
  }

  /**
   * Get ability data - tries API first, falls back to local data
   */
  async getAbility(abilityName: string): Promise<Ability | null> {
    const cacheKey = `ability-${abilityName.toLowerCase()}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Ability;
    }

    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/ability/${abilityName.toLowerCase()}`);
      if (response.ok) {
        const ability = await response.json() as Ability;
        this.cache.set(cacheKey, ability);
        return ability;
      }
    } catch (error) {
      console.warn(`API call failed for ability ${abilityName}, using fallback data:`, error);
    }

    // Fall back to local data
    const fallbackAbility = this.fallback.abilities.find((a: FallbackAbility) => a.name === abilityName.toLowerCase());
    if (fallbackAbility) {
      this.cache.set(cacheKey, fallbackAbility);
      return fallbackAbility as unknown as Ability;
    }

    return null;
  }

  /**
   * Get nature data - returns local data (natures don't change)
   */
  getNature(natureName: string): Nature | null {
    const foundNature = this.fallback.natures.find((n: FallbackNature) => n.name === natureName.toLowerCase());
    return foundNature ? (foundNature as unknown as Nature) : null;
  }

  /**
   * Search Pokemon by name - returns available Pokemon names for autocomplete
   */
  searchPokemon(query: string): string[] {
    const localNames = Object.keys(this.fallback.pokemon);
    const cacheNames = Array.from(this.cache.keys())
      .filter(key => key.startsWith('pokemon-'))
      .map(key => key.replace('pokemon-', ''));

    const allNames = [...new Set([...localNames, ...cacheNames])];

    if (!query) {
      return allNames.slice(0, 20); // Return first 20 for initial load
    }

    return allNames
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Return up to 10 matches
  }

  /**
   * Search moves by name - returns available move names for autocomplete
   */
  searchMoves(query: string): string[] {
    const localMoves = this.fallback.moves.map((m: FallbackMove) => m.name);
    const cacheMoves = Array.from(this.cache.keys())
      .filter(key => key.startsWith('move-'))
      .map(key => key.replace('move-', ''));

    const allMoves = [...new Set([...localMoves, ...cacheMoves])];

    if (!query) {
      return allMoves.slice(0, 20);
    }

    return allMoves
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }

  /**
   * Search items by name - returns available item names for autocomplete
   */
  searchItems(query: string): string[] {
    const localItems = this.fallback.items.map((i: FallbackItem) => i.name);
    const cacheItems = Array.from(this.cache.keys())
      .filter(key => key.startsWith('item-'))
      .map(key => key.replace('item-', ''));

    const allItems = [...new Set([...localItems, ...cacheItems])];

    if (!query) {
      return allItems.slice(0, 20);
    }

    return allItems
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }

  /**
   * Search abilities by name - returns available ability names for autocomplete
   */
  searchAbilities(query: string): string[] {
    const localAbilities = this.fallback.abilities.map((a: FallbackAbility) => a.name);
    const cacheAbilities = Array.from(this.cache.keys())
      .filter(key => key.startsWith('ability-'))
      .map(key => key.replace('ability-', ''));

    const allAbilities = [...new Set([...localAbilities, ...cacheAbilities])];

    if (!query) {
      return allAbilities.slice(0, 20);
    }

    return allAbilities
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);
  }

  /**
   * Get all nature names
   */
  getAllNatures(): string[] {
    return this.fallback.natures.map((n: FallbackNature) => n.name);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Pre-load essential data for better UX
   */
  async preloadEssentials(): Promise<void> {
    try {
      // Pre-load some popular Pokemon for better autocomplete
      const popularPokemon = ['pikachu', 'charizard', 'blastoise', 'venusaur'];
      const promises = popularPokemon.map(name =>
        this.getPokemon(name).catch(() => null) // Ignore errors during preload
      );

      await Promise.all(promises);
      console.log('Essential data preloaded');
    } catch (error) {
      console.warn('Failed to preload essential data:', error);
    }
  }
}

// Create singleton instance
export const pokemonDataService = new PokemonDataService();

// Preload essential data when service is imported
pokemonDataService.preloadEssentials();
