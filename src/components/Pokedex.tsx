import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Button,
  IconButton,
  Drawer,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Search as SearchIcon,
  CatchingPokemon as PokemonIcon,
  Analytics as AnalyticsIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/pokemonDataService';
import PokemonTypeChip from './PokemonTypeChip';
import PokemonDetailDialog from './PokemonDetailDialog';
import type { Pokemon, NamedAPIResource } from '../types/pokemon';

const ITEMS_PER_LOAD = 50; // Load 50 Pokemon at a time for infinite scroll
const INITIAL_LOAD = 150; // Load first 150 Pokemon initially

const POKEMON_TYPES = [
  'all', 'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Enhanced interface for Pokedex display with more data
interface EnhancedPokedexPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
  height: number;
  weight: number;
  generation: number;
  isFavorite?: boolean;
}

interface PokemonAnalytics {
  totalPokemon: number;
  averageStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
  typeDistribution: { [key: string]: number };
  generationDistribution: { [key: string]: number };
  statRanges: {
    minTotal: number;
    maxTotal: number;
    minHp: number;
    maxHp: number;
    minAttack: number;
    maxAttack: number;
    minDefense: number;
    maxDefense: number;
    minSpeed: number;
    maxSpeed: number;
  };
}

interface PokemonCardProps {
  pokemon: EnhancedPokedexPokemon;
  onClick: () => void;
  viewMode: 'grid' | 'list';
  onToggleFavorite?: (pokemon: EnhancedPokedexPokemon) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick, viewMode, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(pokemon);
  };

  if (viewMode === 'list') {
    return (
      <Card
        sx={{
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <CardActionArea onClick={onClick}>
          <CardContent sx={{ py: 1.5 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={1}>
                <Typography variant="h6" color="text.secondary" fontWeight="bold">
                  #{pokemon.id.toString().padStart(3, '0')}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {!imageLoaded && !imageError && pokemon.sprite && (
                    <Skeleton variant="circular" width={48} height={48} />
                  )}

                  {imageError || !pokemon.sprite ? (
                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}>
                      <PokemonIcon />
                    </Avatar>
                  ) : (
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'contain',
                        display: imageLoaded ? 'block' : 'none',
                      }}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  )}
                </Box>
              </Grid>
              <Grid size={2}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                  {pokemon.name}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {pokemon.types.map((type: string) => (
                    <PokemonTypeChip key={type} type={type} size="small" />
                  ))}
                </Box>
              </Grid>
              <Grid size={2}>
                <Typography variant="body2" color="text.secondary">
                  Total: <strong>{pokemon.baseStats.total}</strong>
                </Typography>
              </Grid>
              <Grid size={3}>
                <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">HP</Typography>
                    <Typography variant="body2" fontWeight="600">{pokemon.baseStats.hp}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">ATK</Typography>
                    <Typography variant="body2" fontWeight="600">{pokemon.baseStats.attack}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">DEF</Typography>
                    <Typography variant="body2" fontWeight="600">{pokemon.baseStats.defense}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">SPD</Typography>
                    <Typography variant="body2" fontWeight="600">{pokemon.baseStats.speed}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={1}>
                <IconButton
                  onClick={handleFavoriteClick}
                  color={pokemon.isFavorite ? 'error' : 'default'}
                  size="small"
                >
                  {pokemon.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 2,
        }}
      >
        {/* Favorite Button */}
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
            },
          }}
          size="small"
          color={pokemon.isFavorite ? 'error' : 'default'}
        >
          {pokemon.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>

        {/* Pokemon Sprite */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 120,
            position: 'relative',
            mb: 1,
          }}
        >
          {!imageLoaded && !imageError && pokemon.sprite && (
            <Skeleton variant="circular" width={96} height={96} />
          )}

          {imageError || !pokemon.sprite ? (
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: 'primary.light',
                fontSize: '2rem',
              }}
            >
              <PokemonIcon />
            </Avatar>
          ) : (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              style={{
                width: 96,
                height: 96,
                objectFit: 'contain',
                display: imageLoaded ? 'block' : 'none',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Pokemon ID Badge */}
          <Chip
            label={`#${pokemon.id.toString().padStart(3, '0')}`}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />

          {/* Generation Badge */}
          <Chip
            label={`Gen ${pokemon.generation}`}
            size="small"
            variant="outlined"
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              fontSize: '0.6rem',
              height: 20,
            }}
          />
        </Box>

        {/* Pokemon Name */}
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 1,
            fontWeight: 600,
            textTransform: 'capitalize',
            color: 'primary.main',
          }}
        >
          {pokemon.name}
        </Typography>

        {/* Pokemon Types */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            mb: 1,
          }}
        >
          {pokemon.types.map((type: string) => (
            <PokemonTypeChip key={type} type={type} size="small" />
          ))}
        </Box>

        {/* Base Stats Preview */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 'auto',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            fontSize: '0.75rem',
          }}
        >
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              HP
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {pokemon.baseStats.hp}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              ATK
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {pokemon.baseStats.attack}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              DEF
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {pokemon.baseStats.defense}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              SPD
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {pokemon.baseStats.speed}
            </Typography>
          </Box>
        </Box>

        {/* Total Stats Bar */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Total Stats
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {pokemon.baseStats.total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((pokemon.baseStats.total / 720) * 100, 100)}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: pokemon.baseStats.total > 500 ? '#4caf50' : pokemon.baseStats.total > 400 ? '#ff9800' : '#f44336',
              },
            }}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
};

const Pokedex: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Pokemon data
  const [pokemonList, setPokemonList] = useState<EnhancedPokedexPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Analytics and filters
  const [analytics, setAnalytics] = useState<PokemonAnalytics | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [statFilters, setStatFilters] = useState({
    minTotal: 0,
    maxTotal: 720,
    minHp: 0,
    maxHp: 255,
    minAttack: 0,
    maxAttack: 255,
    minDefense: 0,
    maxDefense: 255,
    minSpeed: 0,
    maxSpeed: 255,
  });

  // Dialog states
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Infinite scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Helper function to get generation from Pokemon ID
  const getPokemonGeneration = useCallback((id: number): number => {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  }, []);

  // Load Pokemon data initially and in batches
  const loadPokemonBatch = useCallback(async (offset: number, limit: number) => {
    try {
      const listResponse = await pokemonDataService.getPokemonList(limit, offset);
      if (!listResponse.success || !listResponse.data) {
        throw new Error('Failed to load Pokemon list');
      }

      const pokemonPromises = listResponse.data.results.map(async (pokemonRef: NamedAPIResource) => {
        try {
          const pokemonResponse = await pokemonDataService.getPokemon(pokemonRef.name);
          if (!pokemonResponse.success || !pokemonResponse.data) {
            return null;
          }

          const pokemon = pokemonResponse.data;
          const generation = getPokemonGeneration(pokemon.id);

          const enhancedPokemon: EnhancedPokedexPokemon = {
            id: pokemon.id,
            name: pokemon.name,
            types: pokemon.types.map((typeInfo) => typeInfo.type.name),
            sprite: pokemon.sprites.front_default || null,
            baseStats: {
              hp: pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 0,
              attack: pokemon.stats.find((stat) => stat.stat.name === 'attack')?.base_stat || 0,
              defense: pokemon.stats.find((stat) => stat.stat.name === 'defense')?.base_stat || 0,
              specialAttack: pokemon.stats.find((stat) => stat.stat.name === 'special-attack')?.base_stat || 0,
              specialDefense: pokemon.stats.find((stat) => stat.stat.name === 'special-defense')?.base_stat || 0,
              speed: pokemon.stats.find((stat) => stat.stat.name === 'speed')?.base_stat || 0,
              total: pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
            },
            height: pokemon.height,
            weight: pokemon.weight,
            generation,
            isFavorite: false,
          };

          return enhancedPokemon;
        } catch (err) {
          console.warn(`Failed to load Pokemon ${pokemonRef.name}:`, err);
          return null;
        }
      });

      const pokemonResults = await Promise.all(pokemonPromises);
      const validPokemon = pokemonResults.filter((pokemon): pokemon is EnhancedPokedexPokemon => pokemon !== null);

      return validPokemon;
    } catch (err) {
      console.error('Error loading Pokemon batch:', err);
      return [];
    }
  }, [getPokemonGeneration]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const initialBatch = await loadPokemonBatch(0, INITIAL_LOAD);
        setPokemonList(initialBatch);

        if (initialBatch.length < INITIAL_LOAD) {
          setHasMore(false);
        }
      } catch (err) {
        setError('Failed to load Pokemon data. Please try again later.');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadPokemonBatch]);

  // Calculate analytics when Pokemon list changes
  useEffect(() => {
    if (pokemonList.length === 0) return;

    const calculateAnalytics = () => {
      const totalPokemon = pokemonList.length;

      // Average stats
      const totalStats = pokemonList.reduce((acc, pokemon) => ({
        hp: acc.hp + pokemon.baseStats.hp,
        attack: acc.attack + pokemon.baseStats.attack,
        defense: acc.defense + pokemon.baseStats.defense,
        specialAttack: acc.specialAttack + pokemon.baseStats.specialAttack,
        specialDefense: acc.specialDefense + pokemon.baseStats.specialDefense,
        speed: acc.speed + pokemon.baseStats.speed,
        total: acc.total + pokemon.baseStats.total,
      }), { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, total: 0 });

      const averageStats = {
        hp: Math.round(totalStats.hp / totalPokemon),
        attack: Math.round(totalStats.attack / totalPokemon),
        defense: Math.round(totalStats.defense / totalPokemon),
        specialAttack: Math.round(totalStats.specialAttack / totalPokemon),
        specialDefense: Math.round(totalStats.specialDefense / totalPokemon),
        speed: Math.round(totalStats.speed / totalPokemon),
        total: Math.round(totalStats.total / totalPokemon),
      };

      // Type distribution
      const typeDistribution: { [key: string]: number } = {};
      pokemonList.forEach(pokemon => {
        pokemon.types.forEach(type => {
          typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        });
      });

      // Generation distribution
      const generationDistribution: { [key: string]: number } = {};
      pokemonList.forEach(pokemon => {
        const gen = `Gen ${pokemon.generation}`;
        generationDistribution[gen] = (generationDistribution[gen] || 0) + 1;
      });

      // Stat ranges
      const statRanges = pokemonList.reduce((ranges, pokemon) => ({
        minTotal: Math.min(ranges.minTotal, pokemon.baseStats.total),
        maxTotal: Math.max(ranges.maxTotal, pokemon.baseStats.total),
        minHp: Math.min(ranges.minHp, pokemon.baseStats.hp),
        maxHp: Math.max(ranges.maxHp, pokemon.baseStats.hp),
        minAttack: Math.min(ranges.minAttack, pokemon.baseStats.attack),
        maxAttack: Math.max(ranges.maxAttack, pokemon.baseStats.attack),
        minDefense: Math.min(ranges.minDefense, pokemon.baseStats.defense),
        maxDefense: Math.max(ranges.maxDefense, pokemon.baseStats.defense),
        minSpeed: Math.min(ranges.minSpeed, pokemon.baseStats.speed),
        maxSpeed: Math.max(ranges.maxSpeed, pokemon.baseStats.speed),
      }), {
        minTotal: Infinity,
        maxTotal: 0,
        minHp: Infinity,
        maxHp: 0,
        minAttack: Infinity,
        maxAttack: 0,
        minDefense: Infinity,
        maxDefense: 0,
        minSpeed: Infinity,
        maxSpeed: 0,
      });

      setAnalytics({
        totalPokemon,
        averageStats,
        typeDistribution,
        generationDistribution,
        statRanges,
      });
    };

    calculateAnalytics();
  }, [pokemonList]);

  // Load more Pokemon for infinite scroll
  const loadMorePokemon = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const currentLength = pokemonList.length;
      const newBatch = await loadPokemonBatch(currentLength, ITEMS_PER_LOAD);

      if (newBatch.length === 0) {
        setHasMore(false);
      } else {
        setPokemonList(prev => [...prev, ...newBatch]);
      }
    } catch (err) {
      console.error('Error loading more Pokemon:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadPokemonBatch, loadingMore, hasMore, pokemonList.length]);

  // Set up intersection observer for infinite scroll
  const lastPokemonElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMorePokemon();
      }
    }, { threshold: 0.1 });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore, loadMorePokemon]);

  // Filter, sort, and search Pokemon
  const filteredAndSortedPokemon = useMemo(() => {
    let filtered = pokemonList.filter(pokemon => {
      // Search filter
      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pokemon.id.toString().includes(searchTerm);

      // Generation filter
      const matchesGeneration = selectedGeneration === 'all' ||
        pokemon.generation.toString() === selectedGeneration;

      // Type filter
      const matchesType = selectedType === 'all' ||
        pokemon.types.includes(selectedType);

      // Favorites filter
      const matchesFavorites = !showFavoritesOnly || favorites.has(pokemon.id);

      // Stat filters
      const matchesStats =
        pokemon.baseStats.total >= statFilters.minTotal &&
        pokemon.baseStats.total <= statFilters.maxTotal &&
        pokemon.baseStats.hp >= statFilters.minHp &&
        pokemon.baseStats.hp <= statFilters.maxHp &&
        pokemon.baseStats.attack >= statFilters.minAttack &&
        pokemon.baseStats.attack <= statFilters.maxAttack &&
        pokemon.baseStats.defense >= statFilters.minDefense &&
        pokemon.baseStats.defense <= statFilters.maxDefense &&
        pokemon.baseStats.speed >= statFilters.minSpeed &&
        pokemon.baseStats.speed <= statFilters.maxSpeed;

      return matchesSearch && matchesGeneration && matchesType && matchesFavorites && matchesStats;
    });

    // Apply favorites status
    filtered = filtered.map(pokemon => ({
      ...pokemon,
      isFavorite: favorites.has(pokemon.id),
    }));

    // Sort Pokemon
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'total':
          compareValue = a.baseStats.total - b.baseStats.total;
          break;
        case 'hp':
          compareValue = a.baseStats.hp - b.baseStats.hp;
          break;
        case 'attack':
          compareValue = a.baseStats.attack - b.baseStats.attack;
          break;
        case 'defense':
          compareValue = a.baseStats.defense - b.baseStats.defense;
          break;
        case 'speed':
          compareValue = a.baseStats.speed - b.baseStats.speed;
          break;
        case 'height':
          compareValue = a.height - b.height;
          break;
        case 'weight':
          compareValue = a.weight - b.weight;
          break;
        default: // 'id'
          compareValue = a.id - b.id;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [pokemonList, searchTerm, selectedGeneration, selectedType, showFavoritesOnly, favorites, statFilters, sortBy, sortOrder]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback((pokemon: EnhancedPokedexPokemon) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(pokemon.id)) {
        newFavorites.delete(pokemon.id);
      } else {
        newFavorites.add(pokemon.id);
      }
      return newFavorites;
    });
  }, []);

  // Open Pokemon details
  const handlePokemonClick = useCallback(async (pokemon: EnhancedPokedexPokemon) => {
    const fullPokemonResponse = await pokemonDataService.getPokemon(pokemon.name);
    if (fullPokemonResponse.success && fullPokemonResponse.data) {
      setSelectedPokemon(fullPokemonResponse.data);
      setShowDetailDialog(true);
    }
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGeneration('all');
    setSelectedType('all');
    setSortBy('id');
    setSortOrder('asc');
    setShowFavoritesOnly(false);
    setStatFilters({
      minTotal: 0,
      maxTotal: 720,
      minHp: 0,
      maxHp: 255,
      minAttack: 0,
      maxAttack: 255,
      minDefense: 0,
      maxDefense: 255,
      minSpeed: 0,
      maxSpeed: 255,
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          <PokemonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Pokédex
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 24 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card sx={{ height: 280 }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={96} height={96} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mt: 1 }} />
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        <PokemonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Enhanced Pokédex
      </Typography>

      {/* Controls and Analytics Toggle */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or ID..."
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 250, flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Generation</InputLabel>
          <Select
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(e.target.value)}
            label="Generation"
          >
            <MenuItem value="all">All Generations</MenuItem>
            {Array.from({ length: 9 }, (_, i) => (
              <MenuItem key={i + 1} value={(i + 1).toString()}>
                Gen {i + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            {POKEMON_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="total">Base Stat Total</MenuItem>
            <MenuItem value="hp">HP</MenuItem>
            <MenuItem value="attack">Attack</MenuItem>
            <MenuItem value="defense">Defense</MenuItem>
            <MenuItem value="speed">Speed</MenuItem>
            <MenuItem value="height">Height</MenuItem>
            <MenuItem value="weight">Weight</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          startIcon={<SortIcon />}
        >
          {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </Button>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ListViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          startIcon={<FavoriteIcon />}
          color={showFavoritesOnly ? 'primary' : 'inherit'}
        >
          Favorites ({favorites.size})
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowAnalytics(!showAnalytics)}
          startIcon={<AnalyticsIcon />}
        >
          Analytics
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={handleResetFilters}
          startIcon={<ClearIcon />}
        >
          Reset Filters
        </Button>
      </Box>

      {/* Statistics Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredAndSortedPokemon.length} of {pokemonList.length} Pokémon
          {searchTerm && ` (filtered by "${searchTerm}")`}
          {selectedGeneration !== 'all' && ` (Gen ${selectedGeneration})`}
          {selectedType !== 'all' && ` (${selectedType} type)`}
          {showFavoritesOnly && ` (favorites only)`}
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Pokemon Grid/List */}
        <Box sx={{ flex: 1 }}>
          {filteredAndSortedPokemon.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No Pokémon found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={2} ref={scrollRef}>
              {filteredAndSortedPokemon.map((pokemon, index) => (
                <Grid
                  key={pokemon.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  ref={index === filteredAndSortedPokemon.length - 1 ? lastPokemonElementRef : null}
                >
                  <PokemonCard
                    pokemon={pokemon}
                    viewMode="grid"
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => handlePokemonClick(pokemon)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredAndSortedPokemon.map((pokemon, index) => (
                <Box
                  key={pokemon.id}
                  ref={index === filteredAndSortedPokemon.length - 1 ? lastPokemonElementRef : null}
                >
                  <PokemonCard
                    pokemon={pokemon}
                    viewMode="list"
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => handlePokemonClick(pokemon)}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2, alignSelf: 'center' }} color="text.secondary">
                Loading more Pokémon...
              </Typography>
            </Box>
          )}

          {/* No More Pokemon Indicator */}
          {!hasMore && pokemonList.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 3, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                You've reached the end! All {pokemonList.length} Pokémon loaded.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Analytics Sidebar */}
        <Drawer
          anchor="right"
          open={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          variant="persistent"
          sx={{
            '& .MuiDrawer-paper': {
              position: 'relative',
              width: 320,
              height: 'fit-content',
              maxHeight: '80vh',
              overflowY: 'auto',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Analytics Dashboard
              </Typography>
              <IconButton onClick={() => setShowAnalytics(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {analytics && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Summary Stats */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Summary Statistics
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Pokémon</Typography>
                        <Typography variant="h6">{analytics.totalPokemon}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Avg BST</Typography>
                        <Typography variant="h6">{analytics.averageStats.total}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Favorites</Typography>
                        <Typography variant="h6">{favorites.size}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Filtered</Typography>
                        <Typography variant="h6">{filteredAndSortedPokemon.length}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Average Base Stats */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Average Base Stats
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(analytics.averageStats).map(([stat, value]) => (
                        stat !== 'total' && (
                          <Box key={stat} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                              {stat === 'specialAttack' ? 'Sp. Atk' :
                               stat === 'specialDefense' ? 'Sp. Def' : stat}:
                            </Typography>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={(value / 255) * 100}
                                sx={{ flex: 1, height: 6 }}
                              />
                              <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                                {value}
                              </Typography>
                            </Box>
                          </Box>
                        )
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Type Distribution */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Type Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                      {Object.entries(analytics.typeDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([type, count]) => (
                        <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
                            {type}:
                          </Typography>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(count / analytics.totalPokemon) * 100}
                              sx={{ flex: 1, height: 6 }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                              {count}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Generation Distribution */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Generation Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(analytics.generationDistribution)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([gen, count]) => (
                        <Box key={gen} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 50 }}>
                            {gen}:
                          </Typography>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(count / analytics.totalPokemon) * 100}
                              sx={{ flex: 1, height: 6 }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                              {count}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Drawer>
      </Box>

      {/* Pokemon Detail Dialog */}
      {selectedPokemon && (
        <PokemonDetailDialog
          pokemon={selectedPokemon}
          open={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
        />
      )}
    </Box>
  );
};

export default Pokedex;
