// Core Pokémon data types based on PokéAPI structure

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  forms: NamedAPIResource[];
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  species: NamedAPIResource;
  moves: PokemonMove[];
  past_types?: PokemonTypePast[];
  past_abilities?: PokemonAbilityPast[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: PokemonSpeciesDexEntry[];
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species?: NamedAPIResource;
  evolution_chain: APIResource;
  habitat?: NamedAPIResource;
  generation: NamedAPIResource;
  names: Name[];
  flavor_text_entries: FlavorText[];
  form_descriptions: Description[];
  genera: Genus[];
  varieties: PokemonSpeciesVariety[];
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonAbilityPast {
  generation: NamedAPIResource;
  abilities: PokemonAbility[];
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonTypePast {
  generation: NamedAPIResource;
  types: PokemonType[];
}

export interface PokemonStat {
  stat: NamedAPIResource;
  effort: number;
  base_stat: number;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonMoveVersion {
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
  level_learned_at: number;
  order: number;
}

export interface PokemonSprites {
  front_default?: string;
  front_shiny?: string;
  front_female?: string;
  front_shiny_female?: string;
  back_default?: string;
  back_shiny?: string;
  back_female?: string;
  back_shiny_female?: string;
}

export interface Move {
  id: number;
  name: string;
  accuracy?: number;
  effect_chance?: number;
  pp: number;
  priority: number;
  power?: number;
  damage_class: NamedAPIResource;
  effect_entries: VerboseEffect[];
  flavor_text_entries: MoveFlavorText[];
  generation: NamedAPIResource;
  meta: MoveMetaData;
  names: Name[];
  stat_changes: MoveStatChange[];
  target: NamedAPIResource;
  type: NamedAPIResource;
  learned_by_pokemon: NamedAPIResource[];
}

export interface MoveFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface MoveMetaData {
  ailment: NamedAPIResource;
  category: NamedAPIResource;
  min_hits?: number;
  max_hits?: number;
  min_turns?: number;
  max_turns?: number;
  drain: number;
  healing: number;
  crit_rate: number;
  ailment_chance: number;
  flinch_chance: number;
  stat_chance: number;
}

export interface MoveStatChange {
  change: number;
  stat: NamedAPIResource;
}

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: Name[];
  effect_entries: VerboseEffect[];
  effect_changes: AbilityEffectChange[];
  flavor_text_entries: AbilityFlavorText[];
  pokemon: AbilityPokemon[];
}

export interface AbilityEffectChange {
  effect_entries: Effect[];
  version_group: NamedAPIResource;
}

export interface AbilityFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface AbilityPokemon {
  is_hidden: boolean;
  slot: number;
  pokemon: NamedAPIResource;
}

export interface Item {
  id: number;
  name: string;
  cost: number;
  fling_power?: number;
  fling_effect?: NamedAPIResource;
  attributes: NamedAPIResource[];
  category: NamedAPIResource;
  effect_entries: VerboseEffect[];
  flavor_text_entries: VersionGroupFlavorText[];
  game_indices: GenerationGameIndex[];
  names: Name[];
  sprites: ItemSprites;
  held_by_pokemon: ItemHolderPokemon[];
  baby_trigger_for?: APIResource;
  machines: MachineVersionDetail[];
}

export interface ItemSprites {
  default?: string;
}

export interface ItemHolderPokemon {
  pokemon: NamedAPIResource;
  version_details: ItemHolderPokemonVersionDetail[];
}

export interface ItemHolderPokemonVersionDetail {
  rarity: number;
  version: NamedAPIResource;
}

export interface Nature {
  id: number;
  name: string;
  decreased_stat?: NamedAPIResource;
  increased_stat?: NamedAPIResource;
  hates_flavor?: NamedAPIResource;
  likes_flavor?: NamedAPIResource;
  pokeathlon_stat_changes: NatureStatChange[];
  move_battle_style_preferences: MoveBattleStylePreference[];
  names: Name[];
}

export interface NatureStatChange {
  max_change: number;
  pokeathlon_stat: NamedAPIResource;
}

export interface MoveBattleStylePreference {
  low_hp_preference: number;
  high_hp_preference: number;
  move_battle_style: NamedAPIResource;
}

export interface Type {
  id: number;
  name: string;
  damage_relations: TypeRelations;
  past_damage_relations: TypeRelationsPast[];
  game_indices: GenerationGameIndex[];
  generation: NamedAPIResource;
  move_damage_class?: NamedAPIResource;
  names: Name[];
  pokemon: TypePokemon[];
  moves: NamedAPIResource[];
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

export interface TypeRelationsPast {
  generation: NamedAPIResource;
  damage_relations: TypeRelations;
}

export interface TypePokemon {
  slot: number;
  pokemon: NamedAPIResource;
}

export interface Generation {
  id: number;
  name: string;
  abilities: NamedAPIResource[];
  names: Name[];
  main_region: NamedAPIResource;
  moves: NamedAPIResource[];
  pokemon_species: NamedAPIResource[];
  types: NamedAPIResource[];
  version_groups: NamedAPIResource[];
}

// Common API types
export interface APIResource {
  url: string;
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Name {
  name: string;
  language: NamedAPIResource;
}

export interface Description {
  description: string;
  language: NamedAPIResource;
}

export interface Effect {
  effect: string;
  language: NamedAPIResource;
}

export interface VerboseEffect {
  effect: string;
  short_effect: string;
  language: NamedAPIResource;
}

export interface FlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
}

export interface VersionGroupFlavorText {
  text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface GenerationGameIndex {
  game_index: number;
  generation: NamedAPIResource;
}

export interface MachineVersionDetail {
  machine: APIResource;
  version_group: NamedAPIResource;
}

export interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpeciesDexEntry {
  entry_number: number;
  pokedex: NamedAPIResource;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

// Paginated list response
export interface APIResourceList {
  count: number;
  next?: string;
  previous?: string;
  results: APIResource[];
}

export interface NamedAPIResourceList {
  count: number;
  next?: string;
  previous?: string;
  results: NamedAPIResource[];
}
