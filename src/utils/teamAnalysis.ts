import type { TeamPokemon } from '../types/team';
import type { PokemonStat } from '../types/pokemon';
import { pokemonHelpers } from '../stores/teamStore';
import { pokemonDataService } from '../services/pokemonDataService';

// Pokemon type effectiveness chart
// TODO: Integrate this with the type coverage analysis system
// Currently unused but will be needed for proper weakness/resistance calculations
/*
// Type effectiveness chart (defending type vs attacking type)
// Based on official Pokemon type effectiveness
const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { fighting: 2, ghost: 0 },
  fire: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water: { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
  electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
  grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
  ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { flying: 2, psychic: 2, fairy: 2, rock: 0.5, bug: 0.5, dark: 0.5 },
  poison: { ground: 2, psychic: 2, fighting: 0.5, poison: 0.5, bug: 0.5, grass: 0.5, fairy: 0.5 },
  ground: { water: 2, grass: 2, ice: 2, poison: 0.5, flying: 0, electric: 0, rock: 0.5 },
  flying: { electric: 2, ice: 2, rock: 2, fighting: 0.5, ground: 0, grass: 0.5, bug: 0.5 },
  psychic: { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
  bug: { fire: 2, flying: 2, rock: 2, fighting: 0.5, ground: 0.5, grass: 0.5 },
  rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
  ghost: { ghost: 2, dark: 2, normal: 0, fighting: 0, poison: 0.5, bug: 0.5 },
  dragon: { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
  dark: { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
  steel: { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
  fairy: { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 }
};
*/

// Complete Pokemon type effectiveness chart for proper calculations
const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Helper function to get type effectiveness
function getTypeEffectiveness(attackingType: string, defendingType: string): number {
  const typeChart = TYPE_EFFECTIVENESS[defendingType];
  if (!typeChart) return 1;
  return typeChart[attackingType] ?? 1;
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Pokemon that are commonly used and effective
const COMPETITIVE_POKEMON_SUGGESTIONS: { [type: string]: string[] } = {
  fire: ['charizard', 'arcanine', 'volcarona', 'talonflame', 'rotom-heat'],
  water: ['gyarados', 'rotom-wash', 'azumarill', 'toxapex', 'greninja'],
  electric: ['zapdos', 'raichu', 'magnezone', 'rotom-wash', 'thundurus'],
  grass: ['ferrothorn', 'venusaur', 'kartana', 'breloom', 'tangrowth'],
  ice: ['mamoswine', 'weavile', 'kyurem', 'articuno', 'cloyster'],
  fighting: ['machamp', 'conkeldurr', 'lucario', 'blaziken', 'hawlucha'],
  poison: ['gengar', 'crobat', 'toxapex', 'venusaur', 'nidoking'],
  ground: ['garchomp', 'landorus-therian', 'excadrill', 'mamoswine', 'dugtrio'],
  flying: ['dragonite', 'salamence', 'talonflame', 'aerodactyl', 'crobat'],
  psychic: ['alakazam', 'metagross', 'latios', 'espeon', 'reuniclus'],
  bug: ['volcarona', 'scizor', 'heracross', 'forretress', 'galvantula'],
  rock: ['tyranitar', 'aerodactyl', 'golem', 'aggron', 'kabutops'],
  ghost: ['gengar', 'dragapult', 'aegislash', 'chandelure', 'dusknoir'],
  dragon: ['garchomp', 'dragonite', 'salamence', 'dragapult', 'hydreigon'],
  dark: ['tyranitar', 'hydreigon', 'umbreon', 'weavile', 'absol'],
  steel: ['metagross', 'scizor', 'ferrothorn', 'aegislash', 'magnezone'],
  fairy: ['gardevoir', 'togekiss', 'azumarill', 'clefable', 'sylveon']
};

export interface TypeCoverage {
  weak_to: string[];        // Types that are super effective against this team
  strong_against: string[]; // Types that this team is super effective against
  neutral_to: string[];     // Types with neutral effectiveness
  resists: string[];        // Types that this team resists
  coverage_score: number;   // Overall type coverage score (0-100)
}

export interface TeamSuggestion {
  reason: string;
  suggested_types: string[];
  pokemon_suggestions: string[];
}

export interface RoleAnalysis {
  physical_attackers: number;
  special_attackers: number;
  tanks: number;
  supports: number;
  sweepers: number;
  walls: number;
  balance_score: number;
  missing_roles: string[];
}

export interface StatDistribution {
  avg_hp: number;
  avg_attack: number;
  avg_defense: number;
  avg_special_attack: number;
  avg_special_defense: number;
  avg_speed: number;
  total_bst: number;
  stat_focus: 'balanced' | 'offensive' | 'defensive' | 'speed';
}

export interface MoveCoverage {
  physical_moves: number;
  special_moves: number;
  status_moves: number;
  type_diversity: number;
  priority_moves: number;
  coverage_quality: 'excellent' | 'good' | 'average' | 'poor';
}

export interface CompetitiveViability {
  tier_rating: 'S' | 'A' | 'B' | 'C' | 'D';
  synergy_score: number;
  versatility: number;
  meta_relevance: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Analyze the type coverage of a Pokemon team
 */
export async function analyzeTypeCoverage(team: (TeamPokemon | null)[]): Promise<TypeCoverage> {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  if (validPokemon.length === 0) {
    return {
      weak_to: ALL_TYPES,
      strong_against: [],
      neutral_to: [],
      resists: [],
      coverage_score: 0
    };
  }

  const teamWeaknesses = new Map<string, number>();
  const teamResistances = new Map<string, number>();
  const offensiveCoverage = new Set<string>();

  // Analyze each Pokemon in the team
  for (const pokemon of validPokemon) {
    if (!pokemon.species) continue;
    
    try {
      const pokemonResponse = await pokemonDataService.getPokemon(pokemon.species);
      if (!pokemonResponse.success || !pokemonResponse.data) continue;
      
      const pokemonData = pokemonResponse.data;
      const types = pokemonData.types.map((t: { type: { name: string } }) => t.type.name);
      
      // Add offensive type coverage
      types.forEach((type: string) => {
        offensiveCoverage.add(type);
        
        // Check what types this Pokemon's moves are super effective against
        ALL_TYPES.forEach((defendingType: string) => {
          const effectiveness = getTypeEffectiveness(type, defendingType);
          if (effectiveness > 1) {
            offensiveCoverage.add(defendingType);
          }
        });
      });
      
      // Analyze defensive matchups for dual types
      const typeEffectivenessMap = new Map<string, number>();
      
      // Initialize all attacking types as 1x (neutral)
      ALL_TYPES.forEach((attackingType: string) => {
        typeEffectivenessMap.set(attackingType, 1);
      });
      
      // Apply effectiveness from each type
      types.forEach((defendingType: string) => {
        ALL_TYPES.forEach((attackingType: string) => {
          const currentEffectiveness = typeEffectivenessMap.get(attackingType) || 1;
          const typeEffectiveness = getTypeEffectiveness(attackingType, defendingType);
          typeEffectivenessMap.set(attackingType, currentEffectiveness * typeEffectiveness);
        });
      });
      
      // Categorize weaknesses and resistances
      typeEffectivenessMap.forEach((effectiveness, attackingType) => {
        if (effectiveness > 1) {
          teamWeaknesses.set(attackingType, (teamWeaknesses.get(attackingType) || 0) + 1);
        } else if (effectiveness < 1) {
          teamResistances.set(attackingType, (teamResistances.get(attackingType) || 0) + 1);
        }
      });
    } catch (error) {
      console.warn(`Failed to analyze Pokemon ${pokemon.species}:`, error);
    }
  }

  // Calculate coverage score based on offensive coverage and defensive balance
  const offensiveScore = (offensiveCoverage.size / ALL_TYPES.length) * 60; // 60% weight
  const defensiveScore = Math.max(0, 40 - (teamWeaknesses.size * 2)); // 40% weight, penalize weaknesses
  const coverage_score = Math.min(100, offensiveScore + defensiveScore);
  
  // Find critical weaknesses (types that hit multiple team members super effectively)
  const criticalWeaknesses = Array.from(teamWeaknesses.entries())
    .filter(([, count]) => count >= Math.max(1, validPokemon.length / 3))
    .map(([type]) => type);
  
  // Find strong defensive types (types that multiple team members resist)
  const strongResistances = Array.from(teamResistances.entries())
    .filter(([, count]) => count >= Math.max(1, validPokemon.length / 3))
    .map(([type]) => type);
  
  const weak_to = criticalWeaknesses;
  const strong_against = Array.from(offensiveCoverage);
  const resists = strongResistances;

  return {
    weak_to,
    strong_against,
    neutral_to: ALL_TYPES.filter(t =>
      !weak_to.includes(t) && !strong_against.includes(t) && !resists.includes(t)
    ),
    resists,
    coverage_score: Math.round(coverage_score)
  };
}

/**
 * Get Pokemon suggestions based on current team composition
 */
export function getTeamSuggestions(team: (TeamPokemon | null)[]): TeamSuggestion[] {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  const suggestions: TeamSuggestion[] = [];

  // Suggest based on team size
  if (validPokemon.length === 0) {
    suggestions.push({
      reason: "Start with a well-rounded Pokemon",
      suggested_types: ['dragon', 'water', 'fire', 'electric'],
      pokemon_suggestions: ['garchomp', 'rotom-wash', 'charizard', 'zapdos']
    });
  } else if (validPokemon.length < 3) {
    suggestions.push({
      reason: "Add Pokemon with different types for coverage",
      suggested_types: ['fighting', 'psychic', 'steel'],
      pokemon_suggestions: ['machamp', 'alakazam', 'metagross', 'scizor']
    });
  } else if (validPokemon.length < 6) {
    suggestions.push({
      reason: "Round out your team with defensive options",
      suggested_types: ['fairy', 'ghost', 'ice'],
      pokemon_suggestions: ['togekiss', 'gengar', 'mamoswine', 'clefable']
    });
  }

  // Suggest based on missing common competitive types
  const usedSpecies = new Set(validPokemon.map(p => p.species?.toLowerCase()).filter(Boolean));

  if (!Array.from(usedSpecies).some(species =>
    ['garchomp', 'landorus-therian', 'excadrill'].includes(species || '')
  )) {
    suggestions.push({
      reason: "Consider adding a Ground-type for electric immunity",
      suggested_types: ['ground'],
      pokemon_suggestions: ['garchomp', 'landorus-therian', 'excadrill', 'mamoswine']
    });
  }

  if (!Array.from(usedSpecies).some(species =>
    ['rotom-wash', 'toxapex', 'ferrothorn'].includes(species || '')
  )) {
    suggestions.push({
      reason: "Add a defensive pivot Pokemon",
      suggested_types: ['water', 'steel'],
      pokemon_suggestions: ['rotom-wash', 'toxapex', 'ferrothorn', 'skarmory']
    });
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Get Pokemon suggestions for a specific type
 */
export function getPokemonSuggestionsByType(type: string): string[] {
  return COMPETITIVE_POKEMON_SUGGESTIONS[type.toLowerCase()] || [];
}

/**
 * Check if team has good type synergy
 */
export function hasGoodTypeSynergy(team: (TeamPokemon | null)[]): boolean {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  // Basic synergy check: team should have at least 4 different "role" Pokemon
  // This is a simplified version - real synergy would involve analyzing resistances,
  // offensive coverage, and team roles (sweeper, tank, support, etc.)

  return validPokemon.length >= 4;
}

/**
 * Analyze team roles and balance
 */
export async function analyzeTeamRoles(team: (TeamPokemon | null)[]): Promise<RoleAnalysis> {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  if (validPokemon.length === 0) {
    return {
      physical_attackers: 0,
      special_attackers: 0,
      tanks: 0,
      supports: 0,
      sweepers: 0,
      walls: 0,
      balance_score: 0,
      missing_roles: ['Physical Attacker', 'Special Attacker', 'Tank', 'Support']
    };
  }

  let physicalAttackers = 0;
  let specialAttackers = 0;
  let tanks = 0;
  let supports = 0;
  let sweepers = 0;
  let walls = 0;

  for (const pokemon of validPokemon) {
    if (!pokemon.species) continue;
    
    try {
      const pokemonResponse = await pokemonDataService.getPokemon(pokemon.species);
      if (!pokemonResponse.success || !pokemonResponse.data) continue;
      
      const pokemonData = pokemonResponse.data;
      const stats = pokemonData.stats;
      
      const attack = stats.find((s: PokemonStat) => s.stat.name === 'attack')?.base_stat || 0;
      const specialAttack = stats.find((s: PokemonStat) => s.stat.name === 'special-attack')?.base_stat || 0;
      const defense = stats.find((s: PokemonStat) => s.stat.name === 'defense')?.base_stat || 0;
      const specialDefense = stats.find((s: PokemonStat) => s.stat.name === 'special-defense')?.base_stat || 0;
      const hp = stats.find((s: PokemonStat) => s.stat.name === 'hp')?.base_stat || 0;
      const speed = stats.find((s: PokemonStat) => s.stat.name === 'speed')?.base_stat || 0;
      
      // Determine primary role based on base stats
      if (attack >= 100 && attack > specialAttack) physicalAttackers++;
      if (specialAttack >= 100 && specialAttack > attack) specialAttackers++;
      if ((defense + specialDefense + hp) >= 300) tanks++;
      if (speed >= 100) sweepers++;
      if (defense >= 100 || specialDefense >= 100) walls++;
      
      // Check for support moves (simplified - would need move analysis)
      // For now, assume certain species are supports
      const supportSpecies = ['chansey', 'blissey', 'clefable', 'toxapex', 'ferrothorn'];
      if (supportSpecies.includes(pokemon.species.toLowerCase())) supports++;
      
    } catch (error) {
      console.warn(`Failed to analyze role for Pokemon ${pokemon.species}:`, error);
    }
  }

  const totalRoles = physicalAttackers + specialAttackers + tanks + supports + sweepers + walls;
  const balanceScore = Math.min(100, (totalRoles / validPokemon.length) * 50);
  
  const missingRoles: string[] = [];
  if (physicalAttackers === 0) missingRoles.push('Physical Attacker');
  if (specialAttackers === 0) missingRoles.push('Special Attacker');
  if (tanks === 0) missingRoles.push('Tank');
  if (supports === 0) missingRoles.push('Support');

  return {
    physical_attackers: physicalAttackers,
    special_attackers: specialAttackers,
    tanks,
    supports,
    sweepers,
    walls,
    balance_score: Math.round(balanceScore),
    missing_roles: missingRoles
  };
}

/**
 * Analyze team stat distribution
 */
export async function analyzeStatDistribution(team: (TeamPokemon | null)[]): Promise<StatDistribution> {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  if (validPokemon.length === 0) {
    return {
      avg_hp: 0,
      avg_attack: 0,
      avg_defense: 0,
      avg_special_attack: 0,
      avg_special_defense: 0,
      avg_speed: 0,
      total_bst: 0,
      stat_focus: 'balanced'
    };
  }

  let totalHp = 0, totalAtk = 0, totalDef = 0, totalSpAtk = 0, totalSpDef = 0, totalSpeed = 0;
  let totalBST = 0;
  let analyzedCount = 0;

  for (const pokemon of validPokemon) {
    if (!pokemon.species) continue;
    
    try {
      const pokemonResponse = await pokemonDataService.getPokemon(pokemon.species);
      if (!pokemonResponse.success || !pokemonResponse.data) continue;
      
      const pokemonData = pokemonResponse.data;
      const stats = pokemonData.stats;
      
      const hp = stats.find((s: PokemonStat) => s.stat.name === 'hp')?.base_stat || 0;
      const attack = stats.find((s: PokemonStat) => s.stat.name === 'attack')?.base_stat || 0;
      const defense = stats.find((s: PokemonStat) => s.stat.name === 'defense')?.base_stat || 0;
      const specialAttack = stats.find((s: PokemonStat) => s.stat.name === 'special-attack')?.base_stat || 0;
      const specialDefense = stats.find((s: PokemonStat) => s.stat.name === 'special-defense')?.base_stat || 0;
      const speed = stats.find((s: PokemonStat) => s.stat.name === 'speed')?.base_stat || 0;
      
      totalHp += hp;
      totalAtk += attack;
      totalDef += defense;
      totalSpAtk += specialAttack;
      totalSpDef += specialDefense;
      totalSpeed += speed;
      totalBST += hp + attack + defense + specialAttack + specialDefense + speed;
      analyzedCount++;
      
    } catch (error) {
      console.warn(`Failed to analyze stats for Pokemon ${pokemon.species}:`, error);
    }
  }

  if (analyzedCount === 0) {
    return {
      avg_hp: 0,
      avg_attack: 0,
      avg_defense: 0,
      avg_special_attack: 0,
      avg_special_defense: 0,
      avg_speed: 0,
      total_bst: 0,
      stat_focus: 'balanced'
    };
  }

  const avgHp = Math.round(totalHp / analyzedCount);
  const avgAtk = Math.round(totalAtk / analyzedCount);
  const avgDef = Math.round(totalDef / analyzedCount);
  const avgSpAtk = Math.round(totalSpAtk / analyzedCount);
  const avgSpDef = Math.round(totalSpDef / analyzedCount);
  const avgSpeed = Math.round(totalSpeed / analyzedCount);

  // Determine stat focus
  let statFocus: 'balanced' | 'offensive' | 'defensive' | 'speed' = 'balanced';
  if (avgAtk > 90 || avgSpAtk > 90) statFocus = 'offensive';
  else if (avgDef > 90 || avgSpDef > 90) statFocus = 'defensive';
  else if (avgSpeed > 90) statFocus = 'speed';

  return {
    avg_hp: avgHp,
    avg_attack: avgAtk,
    avg_defense: avgDef,
    avg_special_attack: avgSpAtk,
    avg_special_defense: avgSpDef,
    avg_speed: avgSpeed,
    total_bst: Math.round(totalBST / analyzedCount),
    stat_focus: statFocus
  };
}

/**
 * Analyze move coverage (simplified - would need actual move data)
 */
export async function analyzeMoveCoverage(team: (TeamPokemon | null)[]): Promise<MoveCoverage> {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  // Simplified analysis - in a real implementation, you'd analyze actual moves
  const physicalMoves = validPokemon.length * 2; // Assume 2 physical moves per Pokemon
  const specialMoves = validPokemon.length * 2; // Assume 2 special moves per Pokemon
  const statusMoves = validPokemon.length; // Assume 1 status move per Pokemon
  const typeDiversity = Math.min(18, validPokemon.length * 3); // Max 3 move types per Pokemon
  const priorityMoves = Math.floor(validPokemon.length / 2); // Assume half have priority

  let coverageQuality: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
  if (typeDiversity >= 12) coverageQuality = 'excellent';
  else if (typeDiversity >= 8) coverageQuality = 'good';
  else if (typeDiversity >= 6) coverageQuality = 'average';

  return {
    physical_moves: physicalMoves,
    special_moves: specialMoves,
    status_moves: statusMoves,
    type_diversity: typeDiversity,
    priority_moves: priorityMoves,
    coverage_quality: coverageQuality
  };
}

/**
 * Analyze competitive viability
 */
export async function analyzeCompetitiveViability(team: (TeamPokemon | null)[]): Promise<CompetitiveViability> {
  const validPokemon = team.filter((p): p is TeamPokemon =>
    p !== null && pokemonHelpers.isValidPokemon(p)
  );

  if (validPokemon.length === 0) {
    return {
      tier_rating: 'D',
      synergy_score: 0,
      versatility: 0,
      meta_relevance: 0,
      overall_score: 0,
      strengths: [],
      weaknesses: ['No Pokemon in team']
    };
  }

  // Simplified competitive analysis
  const typeCoverage = await analyzeTypeCoverage(team);
  const roleAnalysis = await analyzeTeamRoles(team);
  const statDistribution = await analyzeStatDistribution(team);

  // Calculate various scores
  const synergyScore = Math.min(100, (typeCoverage.coverage_score + roleAnalysis.balance_score) / 2);
  const versatility = Math.min(100, validPokemon.length * 16.67); // 6 Pokemon = 100%
  const metaRelevance = Math.min(100, statDistribution.total_bst / 6); // Higher BST = more relevant
  
  const overallScore = Math.round((synergyScore + versatility + metaRelevance) / 3);

  // Determine tier rating
  let tierRating: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (overallScore >= 90) tierRating = 'S';
  else if (overallScore >= 80) tierRating = 'A';
  else if (overallScore >= 70) tierRating = 'B';
  else if (overallScore >= 60) tierRating = 'C';

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (typeCoverage.coverage_score >= 80) strengths.push('Excellent type coverage');
  if (roleAnalysis.balance_score >= 80) strengths.push('Well-balanced team roles');
  if (statDistribution.total_bst >= 500) strengths.push('High stat total');
  if (validPokemon.length === 6) strengths.push('Full team composition');

  if (typeCoverage.coverage_score < 60) weaknesses.push('Poor type coverage');
  if (roleAnalysis.missing_roles.length > 2) weaknesses.push('Missing key roles');
  if (validPokemon.length < 4) weaknesses.push('Incomplete team');
  if (typeCoverage.weak_to.length > 3) weaknesses.push('Too many weaknesses');

  return {
    tier_rating: tierRating,
    synergy_score: Math.round(synergyScore),
    versatility: Math.round(versatility),
    meta_relevance: Math.round(metaRelevance),
    overall_score: overallScore,
    strengths,
    weaknesses
  };
}

export const teamAnalysisUtils = {
  analyzeTypeCoverage,
  getTeamSuggestions,
  getPokemonSuggestionsByType,
  hasGoodTypeSynergy,
  analyzeTeamRoles,
  analyzeStatDistribution,
  analyzeMoveCoverage,
  analyzeCompetitiveViability,
};
