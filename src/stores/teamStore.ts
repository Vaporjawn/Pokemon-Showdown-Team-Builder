import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Team, TeamPokemon, StatSpread, GenerationData } from '../types/team';
import { RandomTeamGenerator, type RandomTeamOptions } from '../utils/randomTeamGenerator';
import { pokemonDataService } from '../services/dataService';

// Default values
const DEFAULT_EV_SPREAD: StatSpread = {
  hp: 0,
  attack: 0,
  defense: 0,
  'special-attack': 0,
  'special-defense': 0,
  speed: 0,
};

const DEFAULT_IV_SPREAD: StatSpread = {
  hp: 31,
  attack: 31,
  defense: 31,
  'special-attack': 31,
  'special-defense': 31,
  speed: 31,
};

const createEmptyPokemon = (slotId: string): TeamPokemon => ({
  id: slotId,
  level: 100,
  shiny: false,
  moves: [null, null, null, null],
  evs: { ...DEFAULT_EV_SPREAD },
  ivs: { ...DEFAULT_IV_SPREAD },
  happiness: 255,
});

const createEmptyTeam = (): Team => ({
  id: crypto.randomUUID(),
  name: 'New Team',
  generation: 9,
  format: 'gen9ou',
  pokemon: Array(6).fill(null),
  created_at: new Date(),
  updated_at: new Date(),
});

interface TeamState {
  // Current team data
  currentTeam: Team;
  selectedSlot: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  unsavedChanges: boolean;

  // Generation and format data
  generation: number;
  availableGenerations: GenerationData[];
  currentFormat: string;

  // Actions
  setTeam: (team: Team) => void;
  updateTeamName: (name: string) => void;
  updatePokemon: (slotIndex: number, pokemon: Partial<TeamPokemon>) => void;
  removePokemon: (slotIndex: number) => void;
  selectSlot: (slotIndex: number) => void;
  setGeneration: (generation: number) => void;
  setFormat: (format: string) => void;

  // Team management
  createNewTeam: () => void;
  duplicateTeam: () => void;
  resetTeam: () => void;

  // Import/Export
  importTeam: (teamData: Team) => void;
  exportTeam: () => Team;

  // Validation
  validateTeam: () => string[];

  // Random Team Generation
  generateRandomTeam: (options: RandomTeamOptions) => Promise<void>;

  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markUnsaved: () => void;
  markSaved: () => void;
}

export const useTeamStore = create<TeamState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTeam: createEmptyTeam(),
      selectedSlot: 0,
      isLoading: false,
      error: null,
      unsavedChanges: false,
      generation: 9,
      availableGenerations: [],
      currentFormat: 'gen9ou',

      // Actions
      setTeam: (team: Team) => {
        set({
          currentTeam: {
            ...team,
            updated_at: new Date(),
          },
          unsavedChanges: false,
        });
      },

      updateTeamName: (name: string) => {
        const state = get();
        set({
          currentTeam: {
            ...state.currentTeam,
            name,
            updated_at: new Date(),
          },
          unsavedChanges: true,
        });
      },

      updatePokemon: (slotIndex: number, pokemonUpdate: Partial<TeamPokemon>) => {
        const state = get();
        const newPokemon = [...state.currentTeam.pokemon];

        if (newPokemon[slotIndex]) {
          newPokemon[slotIndex] = {
            ...newPokemon[slotIndex]!,
            ...pokemonUpdate,
          };
        } else {
          newPokemon[slotIndex] = {
            ...createEmptyPokemon(`slot-${slotIndex}`),
            ...pokemonUpdate,
          };
        }

        set({
          currentTeam: {
            ...state.currentTeam,
            pokemon: newPokemon,
            updated_at: new Date(),
          },
          unsavedChanges: true,
        });
      },

      removePokemon: (slotIndex: number) => {
        const state = get();
        const newPokemon = [...state.currentTeam.pokemon];
        newPokemon[slotIndex] = null;

        set({
          currentTeam: {
            ...state.currentTeam,
            pokemon: newPokemon,
            updated_at: new Date(),
          },
          unsavedChanges: true,
        });
      },

      selectSlot: (slotIndex: number) => {
        set({ selectedSlot: slotIndex });
      },

      setGeneration: (generation: number) => {
        const state = get();
        set({
          generation,
          currentTeam: {
            ...state.currentTeam,
            generation,
            updated_at: new Date(),
          },
          unsavedChanges: true,
        });
      },

      setFormat: (format: string) => {
        const state = get();
        set({
          currentFormat: format,
          currentTeam: {
            ...state.currentTeam,
            format,
            updated_at: new Date(),
          },
          unsavedChanges: true,
        });
      },

      createNewTeam: () => {
        set({
          currentTeam: createEmptyTeam(),
          selectedSlot: 0,
          unsavedChanges: false,
          error: null,
        });
      },

      duplicateTeam: () => {
        const state = get();
        const duplicatedTeam: Team = {
          ...state.currentTeam,
          id: crypto.randomUUID(),
          name: `${state.currentTeam.name} (Copy)`,
          created_at: new Date(),
          updated_at: new Date(),
        };

        set({
          currentTeam: duplicatedTeam,
          unsavedChanges: true,
        });
      },

      resetTeam: () => {
        const state = get();
        set({
          currentTeam: {
            ...createEmptyTeam(),
            name: state.currentTeam.name,
            generation: state.generation,
            format: state.currentFormat,
          },
          selectedSlot: 0,
          unsavedChanges: true,
        });
      },

      importTeam: (teamData: Team) => {
        set({
          currentTeam: {
            ...teamData,
            updated_at: new Date(),
          },
          unsavedChanges: false,
          error: null,
        });
      },

      exportTeam: () => {
        return get().currentTeam;
      },

      validateTeam: (): string[] => {
        const state = get();
        const errors: string[] = [];
        const team = state.currentTeam;

        // Check for empty team
        const pokemonCount = team.pokemon.filter(p => p !== null).length;
        if (pokemonCount === 0) {
          errors.push('Team is empty');
          return errors;
        }

        // Validate each Pokemon
        team.pokemon.forEach((pokemon, index) => {
          if (!pokemon) return;

          // Check for required fields
          if (!pokemon.species) {
            errors.push(`Slot ${index + 1}: No Pokémon selected`);
          }

          // Validate EVs
          const totalEvs = Object.values(pokemon.evs).reduce((sum, ev) => sum + ev, 0);
          if (totalEvs > 510) {
            errors.push(`Slot ${index + 1}: EVs total (${totalEvs}) exceeds 510`);
          }

          Object.entries(pokemon.evs).forEach(([stat, value]) => {
            if (value < 0 || value > 252) {
              errors.push(`Slot ${index + 1}: ${stat} EV (${value}) must be between 0-252`);
            }
          });

          // Validate IVs
          Object.entries(pokemon.ivs).forEach(([stat, value]) => {
            if (value < 0 || value > 31) {
              errors.push(`Slot ${index + 1}: ${stat} IV (${value}) must be between 0-31`);
            }
          });

          // Validate level
          if (pokemon.level < 1 || pokemon.level > 100) {
            errors.push(`Slot ${index + 1}: Level (${pokemon.level}) must be between 1-100`);
          }

          // Validate happiness
          if (pokemon.happiness < 0 || pokemon.happiness > 255) {
            errors.push(`Slot ${index + 1}: Happiness (${pokemon.happiness}) must be between 0-255`);
          }

          // Check for duplicate species (common rule in competitive formats)
          const speciesCount = team.pokemon.filter(p =>
            p && p.species === pokemon.species
          ).length;
          if (speciesCount > 1) {
            errors.push(`Duplicate species: ${pokemon.species} appears ${speciesCount} times`);
          }
        });

        return errors;
      },

      generateRandomTeam: async (options: RandomTeamOptions) => {
        const state = get();

        set({ isLoading: true, error: null });

        try {
          const randomGenerator = new RandomTeamGenerator(pokemonDataService);
          const randomTeam = await randomGenerator.generateRandomTeam(options);

          // Update current team with random team data
          set({
            currentTeam: {
              ...state.currentTeam,
              name: randomTeam.name,
              generation: randomTeam.generation,
              pokemon: randomTeam.pokemon,
              updated_at: new Date(),
            },
            unsavedChanges: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to generate random team:', error);
          set({
            error: `Failed to generate random team: ${error instanceof Error ? error.message : 'Unknown error'}`,
            isLoading: false
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      markUnsaved: () => {
        set({ unsavedChanges: true });
      },

      markSaved: () => {
        set({ unsavedChanges: false });
      },
    }),
    {
      name: 'team-store',
    }
  )
);

// Helper functions for working with Pokemon data
export const pokemonHelpers = {
  // Calculate actual stats based on base stats, EVs, IVs, nature, and level
  calculateStat: (
    baseStat: number,
    ev: number,
    iv: number,
    level: number,
    natureMod: number = 1,
    isHP: boolean = false
  ): number => {
    if (isHP) {
      return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor((Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMod);
    }
  },

  // Get stat total for display
  getStatTotal: (pokemon: TeamPokemon): number => {
    return Object.values(pokemon.evs).reduce((sum, ev) => sum + ev, 0);
  },

  // Check if Pokemon is valid (has required fields)
  isValidPokemon: (pokemon: TeamPokemon | null): boolean => {
    return !!(pokemon && pokemon.species);
  },

  // Get Pokemon display name
  getDisplayName: (pokemon: TeamPokemon): string => {
    if (!pokemon.species) return 'Empty Slot';
    return pokemon.nickname || pokemon.species;
  },

  // Generate a unique ID for team slot
  generateSlotId: (): string => {
    return `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};
