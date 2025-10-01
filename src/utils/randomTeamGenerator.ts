import type { Team, TeamPokemon, StatSpread } from '../types/team';
import type { Pokemon } from '../types/pokemon';
import type { PokemonDataService } from '../services/dataService';

export interface RandomTeamOptions {
  mode: 'competitive' | 'chaos';
  generation?: number;
  format?: string;
  allowLegendaries?: boolean;
  allowUnevolved?: boolean;
}

// Tier-based level assignments based on Pokemon Showdown data
const TIER_LEVELS: Record<string, number> = {
  'LC': 5,          // Little Cup
  'NFE': 90,        // Not Fully Evolved
  'LC Uber': 86,
  'NU': 86,         // Never Used
  'BL3': 84,        // Borderline 3
  'RU': 82,         // Rarely Used
  'BL2': 80,        // Borderline 2
  'UU': 78,         // Under Used
  'BL': 76,         // Borderline
  'OU': 74,         // Over Used
  'CAP': 74,        // Create-A-Pokémon
  'Unreleased': 74,
  'Uber': 70,       // Uber tier
};

// Common competitive items by category
const COMPETITIVE_ITEMS = {
  offensive: ['Life Orb', 'Choice Band', 'Choice Scarf', 'Choice Specs', 'Expert Belt', 'Muscle Band', 'Wise Glasses'],
  defensive: ['Leftovers', 'Rocky Helmet', 'Assault Vest', 'Sitrus Berry', 'Lum Berry', 'Mental Herb'],
  utility: ['Focus Sash', 'Light Clay', 'Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock'],
  healing: ['Leftovers', 'Black Sludge', 'Shell Bell', 'Sitrus Berry', 'Oran Berry']
};

// Common competitive natures
const COMPETITIVE_NATURES = {
  physical: ['Adamant', 'Jolly', 'Brave', 'Impish', 'Careful'],
  special: ['Modest', 'Timid', 'Quiet', 'Bold', 'Calm'],
  mixed: ['Hasty', 'Naive', 'Lonely', 'Mild', 'Rash', 'Naughty'],
  defensive: ['Bold', 'Impish', 'Calm', 'Careful', 'Relaxed', 'Sassy']
};

export class RandomTeamGenerator {
  private dataService: PokemonDataService;

  constructor(dataService: PokemonDataService) {
    this.dataService = dataService;
  }

  async generateRandomTeam(options: RandomTeamOptions): Promise<Team> {
    const pokemon = await this.generateRandomPokemonList(options);
    const teamMembers: (TeamPokemon | null)[] = [];

    for (let i = 0; i < 6; i++) {
      if (pokemon[i]) {
        const randomPokemon = await this.generateRandomPokemon(pokemon[i], options);
        teamMembers.push(randomPokemon);
      } else {
        // If we don't have enough Pokémon, fill remaining slots with empty ones
        teamMembers.push(null);
      }
    }

    return {
      name: `Random Team (${options.mode === 'competitive' ? 'Competitive' : 'Chaos'})`,
      generation: options.generation || 9,
      pokemon: teamMembers
    };
  }

  private async generateRandomPokemonList(options: RandomTeamOptions): Promise<string[]> {
    const allPokemon = this.dataService.searchPokemon(''); // Get all Pokemon names
    let availablePokemon = [...allPokemon];

    // Filter by generation if specified
    if (options.generation) {
      availablePokemon = await this.filterByGeneration(availablePokemon, options.generation);
    }

    // Apply competitive filters
    if (options.mode === 'competitive') {
      if (!options.allowLegendaries) {
        availablePokemon = this.filterOutLegendaries(availablePokemon);
      }

      if (!options.allowUnevolved) {
        availablePokemon = await this.filterOutUnevolved(availablePokemon);
      }
    }

    // Randomly select 6 unique Pokémon
    return this.selectRandomUnique(availablePokemon, 6);
  }

  private async filterByGeneration(pokemon: string[], generation: number): Promise<string[]> {
    // For now, we'll use a simple approach based on Pokédex numbers
    // Generation 1: 1-151, Gen 2: 152-251, etc.
    const genRanges: Record<number, [number, number]> = {
      1: [1, 151],
      2: [152, 251],
      3: [252, 386],
      4: [387, 493],
      5: [494, 649],
      6: [650, 721],
      7: [722, 809],
      8: [810, 905],
      9: [906, 1025]
    };

    const range = genRanges[generation];
    if (!range) return pokemon;

    // For simplicity, we'll just return all pokemon for now
    // In a full implementation, we'd need to fetch Pokemon data to get their IDs
    return pokemon;
  }

  private filterOutLegendaries(pokemon: string[]): string[] {
    // List of known legendary/mythical Pokémon names (simplified)
    const legendaries = [
      'mew', 'mewtwo', 'articuno', 'zapdos', 'moltres',
      'raikou', 'entei', 'suicune', 'lugia', 'ho-oh', 'celebi',
      'regirock', 'regice', 'registeel', 'latios', 'latias', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys',
      'dialga', 'palkia', 'giratina', 'heatran', 'regigigas', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus',
      // Add more as needed...
    ];

    return pokemon.filter(name => !legendaries.includes(name.toLowerCase()));
  }

  private async filterOutUnevolved(pokemon: string[]): Promise<string[]> {
    // This would need evolution chain data to be fully accurate
    // For now, we'll use a simplified approach with known unevolved forms
    const unevolved = [
      'caterpie', 'metapod', 'weedle', 'kakuna', 'pidgey', 'pidgeotto', 'rattata', 'spearow',
      'pichu', 'cleffa', 'igglybuff', 'togepi', 'togetic', 'magby', 'elekid', 'smoochum',
      // Add more as needed...
    ];

    return pokemon.filter(name => !unevolved.includes(name.toLowerCase()));
  }

  private selectRandomUnique<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private async generateRandomPokemon(pokemonName: string, options: RandomTeamOptions): Promise<TeamPokemon> {
    const pokemonData = await this.dataService.getPokemon(pokemonName);

    if (!pokemonData) {
      return this.createEmptyPokemon();
    }

    const level = this.determineLevel(options);
    const nature = this.selectRandomNature(options);

    // Extract abilities from the Pokemon data
    const abilities = pokemonData.abilities?.map(a => a.ability.name) || [];
    const ability = this.selectRandomAbility(abilities);

    const item = this.selectRandomItem(options);

    // Extract moves from the Pokemon data
    const moves = await this.generateRandomMoves(pokemonData, options);
    const { evs, ivs } = this.generateRandomStats(options);

    return {
      species: pokemonData.name,
      level,
      ability,
      item,
      nature,
      moves,
      evs,
      ivs,
      gender: 'N', // Default to neutral
      shiny: Math.random() < 0.001, // Very rare shiny chance
      happiness: 255
    };
  }

  private determineLevel(options: RandomTeamOptions): number {
    if (options.mode === 'chaos') {
      return Math.floor(Math.random() * 100) + 1; // Level 1-100
    }

    // For competitive, use format-based levels
    if (options.format) {
      const formatLevel = TIER_LEVELS[options.format];
      if (formatLevel) return formatLevel;
    }

    // Default competitive level
    return Math.random() < 0.7 ? 100 : 50; // Mostly level 100, sometimes 50
  }

  private selectRandomNature(options: RandomTeamOptions): string {
    if (options.mode === 'chaos') {
      const allNatures = [
        ...COMPETITIVE_NATURES.physical,
        ...COMPETITIVE_NATURES.special,
        ...COMPETITIVE_NATURES.mixed,
        ...COMPETITIVE_NATURES.defensive,
        'Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky' // Neutral natures
      ];
      return allNatures[Math.floor(Math.random() * allNatures.length)];
    }

    // For competitive, choose based on likely role
    const categories = Object.values(COMPETITIVE_NATURES).flat();
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private selectRandomAbility(abilities: string[]): string {
    if (abilities.length === 0) return '';
    return abilities[Math.floor(Math.random() * abilities.length)];
  }

  private selectRandomItem(options: RandomTeamOptions): string {
    if (options.mode === 'chaos') {
      // In chaos mode, sometimes no item
      if (Math.random() < 0.3) return '';

      const allItems = Object.values(COMPETITIVE_ITEMS).flat();
      return allItems[Math.floor(Math.random() * allItems.length)];
    }

    // For competitive, choose appropriate items
    const categories = Object.values(COMPETITIVE_ITEMS);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return randomCategory[Math.floor(Math.random() * randomCategory.length)];
  }

  private async generateRandomMoves(pokemon: Pokemon, options: RandomTeamOptions): Promise<(string | null)[]> {
    const availableMoves = pokemon.moves?.map(m => m.move.name) || [];

    if (availableMoves.length === 0) {
      return ['Tackle', null, null, null]; // Fallback move
    }

    if (options.mode === 'chaos') {
      // Truly random moves
      const selectedMoves = this.selectRandomUnique(availableMoves, 4);
      const result: (string | null)[] = [];
      for (let i = 0; i < 4; i++) {
        result.push(selectedMoves[i] || null);
      }
      return result;
    }

    // For competitive, try to select viable moves
    const viableMoves = this.filterViableMoves(availableMoves);
    const selectedMoves = this.selectRandomUnique(viableMoves.length > 0 ? viableMoves : availableMoves, 4);

    // Ensure at least one damaging move if possible
    const damagingMoves = selectedMoves.filter((move: string) => this.isDamagingMove(move));
    if (damagingMoves.length === 0 && availableMoves.length > 0) {
      // Try to find a damaging move to replace one slot
      const someDamagingMove = availableMoves.find((move: string) => this.isDamagingMove(move));
      if (someDamagingMove && selectedMoves.length > 0) {
        selectedMoves[0] = someDamagingMove;
      }
    }

    // Pad with nulls if needed and limit to 4
    const result: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      result.push((selectedMoves[i] as string) || null);
    }

    return result;
  }

  private filterViableMoves(moves: string[]): string[] {
    // Filter out clearly non-competitive moves
    const badMoves = ['splash', 'celebrate', 'hold-hands', 'teleport', 'sweet-scent'];
    return moves.filter(move => !badMoves.includes(move.toLowerCase()));
  }

  private isDamagingMove(moveName: string): boolean {
    // Simple heuristic - most moves with these words are damaging
    const damagingKeywords = ['punch', 'kick', 'beam', 'blast', 'bolt', 'tackle', 'slam', 'strike'];
    const lowerName = moveName.toLowerCase();
    return damagingKeywords.some(keyword => lowerName.includes(keyword)) ||
           !['heal', 'recover', 'rest', 'protect', 'defend', 'harden', 'withdraw'].some(keyword => lowerName.includes(keyword));
  }

  private generateRandomStats(options: RandomTeamOptions): { evs: StatSpread; ivs: StatSpread } {
    if (options.mode === 'chaos') {
      // Completely random stats
      return {
        evs: {
          hp: Math.floor(Math.random() * 253),
          attack: Math.floor(Math.random() * 253),
          defense: Math.floor(Math.random() * 253),
          'special-attack': Math.floor(Math.random() * 253),
          'special-defense': Math.floor(Math.random() * 253),
          speed: Math.floor(Math.random() * 253)
        },
        ivs: {
          hp: Math.floor(Math.random() * 32),
          attack: Math.floor(Math.random() * 32),
          defense: Math.floor(Math.random() * 32),
          'special-attack': Math.floor(Math.random() * 32),
          'special-defense': Math.floor(Math.random() * 32),
          speed: Math.floor(Math.random() * 32)
        }
      };
    }

    // For competitive, use sensible EV spreads
    const evs = this.generateCompetitiveEVSpread();
    const ivs: StatSpread = {
      hp: 31,
      attack: 31,
      defense: 31,
      'special-attack': 31,
      'special-defense': 31,
      speed: 31
    };

    // Sometimes adjust Speed IV for Trick Room
    if (Math.random() < 0.1) {
      ivs.speed = 0;
    }

    return { evs, ivs };
  }

  private generateCompetitiveEVSpread(): StatSpread {
    // Standard competitive spreads
    const spreads: StatSpread[] = [
      { hp: 4, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 252 }, // Physical Sweeper
      { hp: 4, attack: 0, defense: 0, 'special-attack': 252, 'special-defense': 0, speed: 252 }, // Special Sweeper
      { hp: 252, attack: 0, defense: 252, 'special-attack': 0, 'special-defense': 4, speed: 0 }, // Physical Wall
      { hp: 252, attack: 0, defense: 4, 'special-attack': 0, 'special-defense': 252, speed: 0 }, // Special Wall
      { hp: 252, attack: 0, defense: 120, 'special-attack': 0, 'special-defense': 136, speed: 0 }, // Mixed Wall
      { hp: 4, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 252 }, // Choice Band
    ];

    return spreads[Math.floor(Math.random() * spreads.length)];
  }

  private createEmptyPokemon(): TeamPokemon {
    return {
      level: 50,
      shiny: false,
      moves: [null, null, null, null],
      evs: {
        hp: 0,
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0
      },
      ivs: {
        hp: 31,
        attack: 31,
        defense: 31,
        'special-attack': 31,
        'special-defense': 31,
        speed: 31
      },
      gender: 'N',
      happiness: 255
    };
  }
}
