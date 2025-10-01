import type { Team, TeamPokemon, StatSpread } from '../types/team';

/**
 * Utility functions for importing/exporting Pokémon Showdown format teams
 */

/**
 * Convert a team to Pokémon Showdown format
 */
export const exportTeamToShowdown = (team: Team): string => {
  const lines: string[] = [];

  team.pokemon.forEach((pokemon, index) => {
    if (!pokemon || !pokemon.species) return; // Skip empty slots

    // Pokemon line: Species (Nickname) @ Item
    let pokemonLine = pokemon.species;
    if (pokemon.nickname && pokemon.nickname !== pokemon.species) {
      pokemonLine = `${pokemon.species} (${pokemon.nickname})`;
    }
    if (pokemon.item) {
      pokemonLine += ` @ ${pokemon.item}`;
    }
    lines.push(pokemonLine);

    // Ability
    if (pokemon.ability) {
      lines.push(`Ability: ${pokemon.ability}`);
    }

    // Level (if not 50)
    if (pokemon.level && pokemon.level !== 50) {
      lines.push(`Level: ${pokemon.level}`);
    }

    // Shiny
    if (pokemon.shiny) {
      lines.push('Shiny: Yes');
    }

    // Happiness (if not 255)
    if (pokemon.happiness !== undefined && pokemon.happiness !== 255) {
      lines.push(`Happiness: ${pokemon.happiness}`);
    }

    // EVs (if any are set)
    const evs = pokemon.evs;
    const evLabels = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
    const evKeys: (keyof StatSpread)[] = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const evEntries = evLabels
      .map((label, i) => evs && evs[evKeys[i]] ? `${evs[evKeys[i]]} ${label}` : null)
      .filter(Boolean);

    if (evEntries.length > 0) {
      lines.push(`EVs: ${evEntries.join(' / ')}`);
    }

    // Nature
    if (pokemon.nature) {
      lines.push(`${pokemon.nature} Nature`);
    }

    // IVs (if any are different from 31)
    const ivs = pokemon.ivs;
    const ivEntries = evLabels
      .map((label, i) => ivs && ivs[evKeys[i]] !== 31 ? `${ivs[evKeys[i]]} ${label}` : null)
      .filter(Boolean);

    if (ivEntries.length > 0) {
      lines.push(`IVs: ${ivEntries.join(' / ')}`);
    }

    // Moves
    pokemon.moves.forEach(move => {
      if (move) {
        lines.push(`- ${move}`);
      }
    });

    // Add blank line between Pokemon (except for the last one)
    if (index < team.pokemon.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\n');
};

/**
 * Parse a Pokémon Showdown format team string into a Team object
 */
export const importTeamFromShowdown = (showdownText: string): Team => {
  const lines = showdownText.split('\n').map(line => line.trim());
  const pokemon: TeamPokemon[] = [];
  let currentPokemon: Partial<TeamPokemon> | null = null;

  const defaultStats: StatSpread = {
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  };

  const defaultEvs: StatSpread = {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  };

  for (const line of lines) {
    if (!line) {
      // Empty line indicates end of current Pokemon
      if (currentPokemon) {
        pokemon.push({
          species: '',
          nickname: '',
          level: 50,
          shiny: false,
          happiness: 255,
          ability: '',
          item: '',
          nature: 'Hardy',
          evs: defaultEvs,
          ivs: defaultStats,
          moves: [null, null, null, null],
          ...currentPokemon,
        } as TeamPokemon);
        currentPokemon = null;
      }
      continue;
    }

    if (line.startsWith('-')) {
      // Move
      if (currentPokemon) {
        if (!currentPokemon.moves) currentPokemon.moves = [null, null, null, null];
        const moveIndex = currentPokemon.moves.findIndex(move => !move);
        if (moveIndex !== -1) {
          currentPokemon.moves[moveIndex] = line.substring(1).trim();
        }
      }
    } else if (line.includes('@')) {
      // Pokemon line with item
      const parts = line.split('@').map(p => p.trim());
      currentPokemon = parsePokemonLine(parts[0]);
      if (parts[1]) {
        currentPokemon.item = parts[1];
      }
    } else if (line.includes('(') && line.includes(')') && !line.includes(':')) {
      // Pokemon line with nickname (no item)
      currentPokemon = parsePokemonLine(line);
    } else if (line.includes(':')) {
      // Property line
      const colonIndex = line.indexOf(':');
      const property = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      if (!currentPokemon) currentPokemon = {};

      switch (property.toLowerCase()) {
        case 'ability':
          currentPokemon.ability = value;
          break;
        case 'level':
          currentPokemon.level = parseInt(value, 10);
          break;
        case 'shiny':
          currentPokemon.shiny = value.toLowerCase() === 'yes';
          break;
        case 'happiness':
          currentPokemon.happiness = parseInt(value, 10);
          break;
        case 'evs':
          currentPokemon.evs = parseStats(value, defaultEvs);
          break;
        case 'ivs':
          currentPokemon.ivs = parseStats(value, defaultStats);
          break;
      }
    } else if (line.includes('Nature')) {
      // Nature line
      const nature = line.replace('Nature', '').trim();
      if (currentPokemon) {
        currentPokemon.nature = nature;
      }
    } else if (!line.includes(':') && !line.startsWith('-')) {
      // Simple Pokemon line (no nickname, no item)
      currentPokemon = { species: line.trim() };
    }
  }

  // Add the last Pokemon if there wasn't a blank line at the end
  if (currentPokemon) {
    pokemon.push({
      species: '',
      nickname: '',
      level: 50,
      shiny: false,
      happiness: 255,
      ability: '',
      item: '',
      nature: 'Hardy',
      evs: defaultEvs,
      ivs: defaultStats,
      moves: [null, null, null, null],
      ...currentPokemon,
    } as TeamPokemon);
  }

  // Pad team to 6 Pokemon
  while (pokemon.length < 6) {
    pokemon.push({
      species: '',
      nickname: '',
      level: 50,
      shiny: false,
      happiness: 255,
      ability: '',
      item: '',
      nature: 'Hardy',
      evs: defaultEvs,
      ivs: defaultStats,
      moves: [null, null, null, null],
    });
  }

  return {
    name: 'Imported Team',
    generation: 9,
    pokemon: pokemon.slice(0, 6),
  };
};

/**
 * Parse Pokemon line to extract species and nickname
 */
const parsePokemonLine = (line: string): Partial<TeamPokemon> => {
  const result: Partial<TeamPokemon> = {};

  if (line.includes('(') && line.includes(')')) {
    // Has nickname: Species (Nickname)
    const nicknameMatch = line.match(/^(.+?)\s*\((.+?)\)$/);
    if (nicknameMatch) {
      result.species = nicknameMatch[1].trim();
      result.nickname = nicknameMatch[2].trim();
    }
  } else {
    // No nickname
    result.species = line.trim();
    result.nickname = '';
  }

  return result;
};

/**
 * Parse stat string (EVs/IVs) into StatSpread object
 */
const parseStats = (statString: string, defaultStats?: StatSpread): StatSpread => {
  const stats: StatSpread = defaultStats || {
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  };

  const statMap: { [key: string]: keyof StatSpread } = {
    'hp': 'hp',
    'atk': 'attack',
    'def': 'defense',
    'spa': 'special-attack',
    'spd': 'special-defense',
    'spe': 'speed',
  };

  const parts = statString.split('/').map(p => p.trim());

  for (const part of parts) {
    const match = part.match(/(\d+)\s+(\w+)/);
    if (match) {
      const value = parseInt(match[1], 10);
      const statName = match[2].toLowerCase();
      const statKey = statMap[statName];

      if (statKey) {
        stats[statKey] = value;
      }
    }
  }

  return stats;
};

/**
 * Validate if a string is a valid Pokémon Showdown format
 */
export const isValidShowdownFormat = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length === 0) return false;

  // Look for at least one Pokemon (species name)
  let hasPokemon = false;

  for (const line of lines) {
    // Skip move lines, property lines
    if (line.startsWith('-') || line.includes(':') || line.includes('Nature')) {
      continue;
    }

    // Found a potential Pokemon line
    if (line.length > 0) {
      hasPokemon = true;
      break;
    }
  }

  return hasPokemon;
};

/**
 * Generate a sample team in Showdown format for testing
 */
export const getSampleShowdownTeam = (): string => {
  return `Charizard @ Life Orb
Ability: Solar Power
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk
- Flamethrower
- Solar Beam
- Air Slash
- Roost

Blastoise @ Leftovers
Ability: Torrent
EVs: 248 HP / 252 SpA / 8 SpD
Modest Nature
IVs: 0 Atk
- Surf
- Ice Beam
- Rapid Spin
- Rest

Venusaur @ Black Sludge
Ability: Chlorophyll
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
IVs: 0 Atk
- Giga Drain
- Sludge Bomb
- Sleep Powder
- Synthesis`;
};
