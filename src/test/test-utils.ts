// Test utility functions for consistent testing
export const mockPokemon = {
  id: 25,
  name: 'pikachu',
  base_experience: 112,
  height: 4,
  weight: 60,
  abilities: [
    {
      ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
      is_hidden: false,
      slot: 1,
    },
  ],
  forms: [],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
  },
  stats: [
    { stat: { name: 'hp', url: '' }, base_stat: 35, effort: 0 },
    { stat: { name: 'attack', url: '' }, base_stat: 55, effort: 0 },
    { stat: { name: 'defense', url: '' }, base_stat: 40, effort: 0 },
    { stat: { name: 'special-attack', url: '' }, base_stat: 50, effort: 0 },
    { stat: { name: 'special-defense', url: '' }, base_stat: 50, effort: 0 },
    { stat: { name: 'speed', url: '' }, base_stat: 90, effort: 2 },
  ],
  types: [
    { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
  ],
  species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
  moves: [],
};

export const mockTeamPokemon = {
  id: 'slot-1',
  species: 'pikachu',
  nickname: 'Sparky',
  level: 100,
  shiny: false,
  moves: ['thunderbolt', 'quick-attack', 'iron-tail', 'volt-tackle'],
  evs: {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 252,
    'special-defense': 4,
    speed: 252,
  },
  ivs: {
    hp: 31,
    attack: 0,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  },
  nature: 'modest',
  ability: 'static',
  item: 'life-orb',
  happiness: 255,
};

// Test helpers for store operations
export const createMockTeam = () => ({
  id: 'test-team-1',
  name: 'Test Team',
  generation: 9,
  format: 'gen9ou',
  pokemon: [mockTeamPokemon, null, null, null, null, null],
  created_at: new Date(),
  updated_at: new Date(),
});

// Helper for testing async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));