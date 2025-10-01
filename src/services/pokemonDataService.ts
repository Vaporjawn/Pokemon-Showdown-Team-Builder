import axios from 'axios';
import type { Pokemon, PokemonSpecies, Move, Ability, Item, Nature, Type, Generation, NamedAPIResourceList } from '../types/pokemon';
import type { APIResponse, CacheEntry } from '../types/team';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

class PokemonDataService {
  private cache = new DataCache();
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  private async fetchWithRetry<T>(url: string): Promise<APIResponse<T>> {
    // Check cache first
    const cached = this.cache.get<T>(url);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios.get<T>(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Pokemon-Team-Builder/1.0'
          }
        });

        // Cache the result
        this.cache.set(url, response.data);

        return { success: true, data: response.data, cached: false };
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    return {
      success: false,
      error: `Failed to fetch data after ${this.retryAttempts} attempts: ${lastError?.message}`,
      cached: false
    };
  }

  // Pokemon related methods
  async getPokemon(idOrName: string): Promise<APIResponse<Pokemon>> {
    const url = `${POKEAPI_BASE_URL}/pokemon/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Pokemon>(url);
  }

  async getPokemonSpecies(idOrName: string): Promise<APIResponse<PokemonSpecies>> {
    const url = `${POKEAPI_BASE_URL}/pokemon-species/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<PokemonSpecies>(url);
  }

  async getPokemonList(limit: number = 1000, offset: number = 0): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Move related methods
  async getMove(idOrName: string): Promise<APIResponse<Move>> {
    const url = `${POKEAPI_BASE_URL}/move/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Move>(url);
  }

  async getMoveList(limit: number = 1000, offset: number = 0): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/move?limit=${limit}&offset=${offset}`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Ability related methods
  async getAbility(idOrName: string): Promise<APIResponse<Ability>> {
    const url = `${POKEAPI_BASE_URL}/ability/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Ability>(url);
  }

  async getAbilityList(limit: number = 1000, offset: number = 0): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/ability?limit=${limit}&offset=${offset}`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Item related methods
  async getItem(idOrName: string): Promise<APIResponse<Item>> {
    const url = `${POKEAPI_BASE_URL}/item/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Item>(url);
  }

  async getItemList(limit: number = 1000, offset: number = 0): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/item?limit=${limit}&offset=${offset}`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Nature related methods
  async getNature(idOrName: string): Promise<APIResponse<Nature>> {
    const url = `${POKEAPI_BASE_URL}/nature/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Nature>(url);
  }

  async getNatureList(): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/nature?limit=25`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Type related methods
  async getType(idOrName: string): Promise<APIResponse<Type>> {
    const url = `${POKEAPI_BASE_URL}/type/${idOrName.toLowerCase()}`;
    return this.fetchWithRetry<Type>(url);
  }

  async getTypeList(): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/type?limit=20`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Generation related methods
  async getGeneration(idOrName: string | number): Promise<APIResponse<Generation>> {
    const url = `${POKEAPI_BASE_URL}/generation/${idOrName}`;
    return this.fetchWithRetry<Generation>(url);
  }

  async getGenerationList(): Promise<APIResponse<NamedAPIResourceList>> {
    const url = `${POKEAPI_BASE_URL}/generation`;
    return this.fetchWithRetry<NamedAPIResourceList>(url);
  }

  // Utility methods
  getIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/);
    return matches ? parseInt(matches[1]) : 0;
  }

  getNameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2] || '';
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  // Generation filtering utility
  async getPokemonByGeneration(generation: number): Promise<APIResponse<string[]>> {
    try {
      const genResponse = await this.getGeneration(generation);
      if (!genResponse.success || !genResponse.data) {
        return { success: false, error: 'Failed to fetch generation data', cached: false };
      }

      const pokemonNames = genResponse.data.pokemon_species.map((species: { name: string }) => species.name);
      return { success: true, data: pokemonNames, cached: genResponse.cached };
    } catch (error) {
      return {
        success: false,
        error: `Error filtering Pokemon by generation: ${error}`,
        cached: false
      };
    }
  }

  async getMovesByGeneration(generation: number): Promise<APIResponse<string[]>> {
    try {
      const genResponse = await this.getGeneration(generation);
      if (!genResponse.success || !genResponse.data) {
        return { success: false, error: 'Failed to fetch generation data', cached: false };
      }

      const moveNames = genResponse.data.moves.map((move: { name: string }) => move.name);
      return { success: true, data: moveNames, cached: genResponse.cached };
    } catch (error) {
      return {
        success: false,
        error: `Error filtering moves by generation: ${error}`,
        cached: false
      };
    }
  }

  async getAbilitiesByGeneration(generation: number): Promise<APIResponse<string[]>> {
    try {
      const genResponse = await this.getGeneration(generation);
      if (!genResponse.success || !genResponse.data) {
        return { success: false, error: 'Failed to fetch generation data', cached: false };
      }

      const abilityNames = genResponse.data.abilities.map((ability: { name: string }) => ability.name);
      return { success: true, data: abilityNames, cached: genResponse.cached };
    } catch (error) {
      return {
        success: false,
        error: `Error filtering abilities by generation: ${error}`,
        cached: false
      };
    }
  }

  // Batch operations
  async batchPokemonData(names: string[]): Promise<{ [name: string]: Pokemon | null }> {
    const results: { [name: string]: Pokemon | null } = {};

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < names.length; i += batchSize) {
      const batch = names.slice(i, i + batchSize);
      const promises = batch.map(async (name) => {
        const response = await this.getPokemon(name);
        return { name, data: response.success ? response.data : null };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ name, data }) => {
        results[name] = data || null;
      });

      // Small delay between batches to be respectful
      if (i + batchSize < names.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/1`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Create a singleton instance
export const pokemonDataService = new PokemonDataService();
export { DataCache, PokemonDataService };
