import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/dataService';
import PokemonTypeChip from './PokemonTypeChip';
import type { Pokemon } from '../types/pokemon';

interface PokemonSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPokemon: (pokemonName: string, pokemon?: Pokemon) => void;
  currentTeamPokemon?: string[];
}

interface PokemonSearchResult {
  name: string;
  data?: Pokemon;
  loading: boolean;
}

// Popular Pokemon for quick selection
const POPULAR_POKEMON = [
  'pikachu', 'charizard', 'blastoise', 'venusaur', 'dragonite', 'mewtwo',
  'mew', 'garchomp', 'lucario', 'greninja', 'dragapult', 'rotom-wash'
];

// Pokemon types for filtering
const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
  'dragon', 'dark', 'steel', 'fairy'
];

// Generations for filtering
const GENERATIONS = [
  { value: 1, label: 'Gen I (Kanto)' },
  { value: 2, label: 'Gen II (Johto)' },
  { value: 3, label: 'Gen III (Hoenn)' },
  { value: 4, label: 'Gen IV (Sinnoh)' },
  { value: 5, label: 'Gen V (Unova)' },
  { value: 6, label: 'Gen VI (Kalos)' },
  { value: 7, label: 'Gen VII (Alola)' },
  { value: 8, label: 'Gen VIII (Galar)' },
  { value: 9, label: 'Gen IX (Paldea)' }
];

// Sorting options
const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'id', label: 'Pokedex Number' },
  { value: 'base-exp', label: 'Base Experience' },
  { value: 'total-stats', label: 'Total Base Stats' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'special-attack', label: 'Sp. Attack' },
  { value: 'special-defense', label: 'Sp. Defense' },
  { value: 'speed', label: 'Speed' }
];

interface SearchFilters {
  type: string;
  generation: number | '';
  minBaseExp: number | '';
  maxBaseExp: number | '';
  minTotalStats: number | '';
  maxTotalStats: number | '';
  sortBy: string;
  showLegendaries: boolean;
}

const TabPanel: React.FC<{ children?: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '16px 0' }}>
    {value === index && children}
  </div>
);

const PokemonCard: React.FC<{
  pokemon: PokemonSearchResult;
  onSelect: (name: string, data?: Pokemon) => void;
  isInTeam?: boolean;
}> = ({ pokemon, onSelect, isInTeam }) => {
  const [imageError, setImageError] = useState(false);

  const getSpriteUrl = (pokemonName: string, shiny = false) => {
    const id = pokemon.data?.id || pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${id}.png`;
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        opacity: isInTeam ? 0.6 : 1,
        border: isInTeam ? '2px solid orange' : 'none',
      }}
      onClick={() => !isInTeam && onSelect(pokemon.name, pokemon.data)}
    >
      <Box sx={{ position: 'relative', height: 120, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pokemon.loading ? (
          <CircularProgress size={40} />
        ) : (
          <>
            {!imageError && (
              <CardMedia
                component="img"
                sx={{ width: 96, height: 96, objectFit: 'contain' }}
                image={getSpriteUrl(pokemon.name)}
                alt={pokemon.name}
                onError={() => setImageError(true)}
              />
            )}
            {imageError && (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No Image</Typography>
              </Box>
            )}
            {isInTeam && (
              <Chip
                label="In Team"
                size="small"
                color="warning"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
          </>
        )}
      </Box>

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize', fontSize: '1rem', fontWeight: 600 }}>
          {pokemon.name.replace('-', ' ')}
        </Typography>

        {pokemon.data && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {pokemon.data.types?.map((type) => (
                <PokemonTypeChip
                  key={type.slot}
                  type={type.type.name}
                  size="small"
                />
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Base Exp: {pokemon.data.base_experience || 'N/A'}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={isInTeam}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pokemon.name, pokemon.data);
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            {isInTeam ? 'In Team' : 'Select'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const PokemonSearchDialog: React.FC<PokemonSearchDialogProps> = ({
  open,
  onClose,
  onSelectPokemon,
  currentTeamPokemon = [],
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pokemonResults, setPokemonResults] = useState<PokemonSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Enhanced filters
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    generation: '',
    minBaseExp: '',
    maxBaseExp: '',
    minTotalStats: '',
    maxTotalStats: '',
    sortBy: 'name',
    showLegendaries: true
  });

  // Load Pokemon data
  const loadPokemonData = async (pokemonNames: string[]) => {
    const results: PokemonSearchResult[] = pokemonNames.map(name => ({
      name,
      loading: true,
    }));

    setPokemonResults(results);

    // Load data for each Pokemon
    const updatedResults = await Promise.all(
      pokemonNames.map(async (name) => {
        try {
          const data = await pokemonDataService.getPokemon(name);
          return {
            name,
            data: data || undefined,
            loading: false,
          };
        } catch (error) {
          console.warn(`Failed to load data for ${name}:`, error);
          return {
            name,
            loading: false,
          };
        }
      })
    );

    setPokemonResults(updatedResults);
  };

  // Handle search
  useEffect(() => {
    if (activeTab === 0) {
      // Popular Pokemon tab
      loadPokemonData(POPULAR_POKEMON);
    } else {
      // Search results tab
      if (searchQuery.trim()) {
        setLoading(true);
        const searchResults = pokemonDataService.searchPokemon(searchQuery);
        loadPokemonData(searchResults);
        setLoading(false);
      } else {
        setPokemonResults([]);
      }
    }
  }, [activeTab, searchQuery]);

  // Enhanced filtering and sorting logic
  const filteredResults = useMemo(() => {
    let results = [...pokemonResults];

    // Filter by type
    if (filters.type) {
      results = results.filter(pokemon => 
        pokemon.data?.types?.some(type => type.type.name === filters.type)
      );
    }

    // Filter by generation (basic estimation based on Pokemon ID)
    if (filters.generation) {
      results = results.filter(pokemon => {
        if (!pokemon.data?.id) return true;
        const id = pokemon.data.id;
        const gen = filters.generation as number;
        
        // Generation ID ranges (approximate)
        const genRanges = {
          1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
          5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 905], 9: [906, 1025]
        };
        
        const range = genRanges[gen as keyof typeof genRanges];
        return range ? id >= range[0] && id <= range[1] : true;
      });
    }

    // Filter by base experience
    if (filters.minBaseExp) {
      results = results.filter(pokemon => 
        (pokemon.data?.base_experience || 0) >= (filters.minBaseExp as number)
      );
    }
    if (filters.maxBaseExp) {
      results = results.filter(pokemon => 
        (pokemon.data?.base_experience || 0) <= (filters.maxBaseExp as number)
      );
    }

    // Filter by total base stats
    if (filters.minTotalStats || filters.maxTotalStats) {
      results = results.filter(pokemon => {
        if (!pokemon.data?.stats) return true;
        
        const totalStats = pokemon.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        
        if (filters.minTotalStats && totalStats < (filters.minTotalStats as number)) return false;
        if (filters.maxTotalStats && totalStats > (filters.maxTotalStats as number)) return false;
        
        return true;
      });
    }

    // Sort results
    results.sort((a, b) => {
      const getStatValue = (pokemon: PokemonSearchResult, statName: string) => {
        if (!pokemon.data?.stats) return 0;
        const stat = pokemon.data.stats.find(s => s.stat.name === statName);
        return stat ? stat.base_stat : 0;
      };

      const getTotalStats = (pokemon: PokemonSearchResult) => {
        if (!pokemon.data?.stats) return 0;
        return pokemon.data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      };

      switch (filters.sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'id':
          return (a.data?.id || 0) - (b.data?.id || 0);
        case 'base-exp':
          return (b.data?.base_experience || 0) - (a.data?.base_experience || 0);
        case 'total-stats':
          return getTotalStats(b) - getTotalStats(a);
        case 'hp':
          return getStatValue(b, 'hp') - getStatValue(a, 'hp');
        case 'attack':
          return getStatValue(b, 'attack') - getStatValue(a, 'attack');
        case 'defense':
          return getStatValue(b, 'defense') - getStatValue(a, 'defense');
        case 'special-attack':
          return getStatValue(b, 'special-attack') - getStatValue(a, 'special-attack');
        case 'special-defense':
          return getStatValue(b, 'special-defense') - getStatValue(a, 'special-defense');
        case 'speed':
          return getStatValue(b, 'speed') - getStatValue(a, 'speed');
        default: // name
          return a.name.localeCompare(b.name);
      }
    });

    return results;
  }, [pokemonResults, filters]);

  const handleSelectPokemon = (pokemonName: string, pokemonData?: Pokemon) => {
    onSelectPokemon(pokemonName, pokemonData);
    onClose();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setFilters(prev => ({ 
      ...prev, 
      type: '', 
      generation: '', 
      minBaseExp: '', 
      maxBaseExp: '', 
      minTotalStats: '', 
      maxTotalStats: '' 
    }));
  };

  const isInCurrentTeam = (pokemonName: string) => {
    return currentTeamPokemon.some(teamPokemon =>
      teamPokemon?.toLowerCase() === pokemonName.toLowerCase()
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Select Pokemon</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mt: 2 }}>
          <Tab icon={<StarIcon />} label="Popular" />
          <Tab icon={<SearchIcon />} label="Search" />
        </Tabs>
      </DialogTitle>

      <DialogContent>
        {/* Search Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search for Pokemon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowFilters(!showFilters)} size="small">
                      <FilterIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: showFilters ? 2 : 0 }}
            />

            {/* Filters */}
            {showFilters && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Type"
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {POKEMON_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Generation</InputLabel>
                    <Select
                      value={filters.generation}
                      label="Generation"
                      onChange={(e) => setFilters(prev => ({ ...prev, generation: e.target.value }))}
                    >
                      <MenuItem value="">All Generations</MenuItem>
                      {GENERATIONS.map((gen) => (
                        <MenuItem key={gen.value} value={gen.value}>
                          {gen.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sort By"
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      type: '', 
                      generation: '', 
                      minBaseExp: '', 
                      maxBaseExp: '', 
                      minTotalStats: '', 
                      maxTotalStats: '' 
                    }))}
                    size="small"
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Results Grid */}
        <Box sx={{ minHeight: 400 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && filteredResults.length === 0 && activeTab === 1 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No Pokemon found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching with a different name or check your spelling
              </Typography>
            </Box>
          )}

          {!loading && filteredResults.length > 0 && (
            <Grid container spacing={2}>
              {filteredResults.map((pokemon) => (
                <Grid key={pokemon.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PokemonCard
                    pokemon={pokemon}
                    onSelect={handleSelectPokemon}
                    isInTeam={isInCurrentTeam(pokemon.name)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Popular Pokemon Tab Content */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" sx={{ mb: 2 }}>Popular Pokemon</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Quick selection from frequently used Pokemon in competitive play
            </Typography>

            <Grid container spacing={2}>
              {pokemonResults.map((pokemon) => (
                <Grid key={pokemon.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PokemonCard
                    pokemon={pokemon}
                    onSelect={handleSelectPokemon}
                    isInTeam={isInCurrentTeam(pokemon.name)}
                  />
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PokemonSearchDialog;
