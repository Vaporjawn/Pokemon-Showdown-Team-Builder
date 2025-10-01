import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
  Chip,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/pokemonDataService';
import PokemonTypeChip from './PokemonTypeChip';
import type { Move, NamedAPIResource } from '../types/pokemon';

interface MoveEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMove: (moveName: string) => void;
  currentMove?: string | null;
  pokemonName?: string;
  generation?: number;
}

interface MoveSearchFilters {
  type: string;
  damageClass: string;
  generation: string;
  power: 'any' | 'low' | 'medium' | 'high';
  accuracy: 'any' | 'low' | 'medium' | 'high' | 'perfect';
  category: 'any' | 'status' | 'physical' | 'special';
}

const MOVE_CATEGORIES = [
  { value: 'any', label: 'All Categories' },
  { value: 'physical', label: 'Physical' },
  { value: 'special', label: 'Special' },
  { value: 'status', label: 'Status' },
];

const POWER_RANGES = [
  { value: 'any', label: 'Any Power' },
  { value: 'low', label: 'Low (1-60)' },
  { value: 'medium', label: 'Medium (61-100)' },
  { value: 'high', label: 'High (101+)' },
];

const ACCURACY_RANGES = [
  { value: 'any', label: 'Any Accuracy' },
  { value: 'low', label: 'Low (≤75%)' },
  { value: 'medium', label: 'Medium (76-90%)' },
  { value: 'high', label: 'High (91-99%)' },
  { value: 'perfect', label: 'Perfect (100%)' },
];

const MoveEditorDialog: React.FC<MoveEditorDialogProps> = ({
  open,
  onClose,
  onSelectMove,
  currentMove,
  pokemonName,
  generation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMoves, setFilteredMoves] = useState<string[]>([]);
  const [selectedMove, setSelectedMove] = useState<string | null>(currentMove || null);
  const [moveDetails, setMoveDetails] = useState<Move | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MoveSearchFilters>({
    type: '',
    damageClass: '',
    generation: generation ? generation.toString() : '',
    power: 'any',
    accuracy: 'any',
    category: 'any',
  });

  const [allMoves, setAllMoves] = useState<string[]>([]);
  const [pokemonMoves, setPokemonMoves] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load all moves
        const movesResponse = await pokemonDataService.getMoveList(1000);
        if (movesResponse.success && movesResponse.data) {
          const moveNames = movesResponse.data.results.map((move: NamedAPIResource) => move.name);
          setAllMoves(moveNames);
          setFilteredMoves(moveNames.slice(0, 50)); // Show first 50 initially
        }

        // Load types for filtering
        const typesResponse = await pokemonDataService.getTypeList();
        if (typesResponse.success && typesResponse.data) {
          const typeNames = typesResponse.data.results.map((type: NamedAPIResource) => type.name);
          setTypes(typeNames);
        }

        // Load Pokemon-specific moves if Pokemon name provided
        if (pokemonName) {
          const pokemonResponse = await pokemonDataService.getPokemon(pokemonName);
          if (pokemonResponse.success && pokemonResponse.data) {
            const learnableMoves = pokemonResponse.data.moves.map((move) => move.move.name);
            setPokemonMoves(learnableMoves);
          }
        }
      } catch (error) {
        console.error('Failed to load move data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open, pokemonName]);

  // Load move details when selected
  useEffect(() => {
    const loadMoveDetails = async () => {
      if (!selectedMove) {
        setMoveDetails(null);
        return;
      }

      setLoading(true);
      try {
        const response = await pokemonDataService.getMove(selectedMove);
        if (response.success && response.data) {
          setMoveDetails(response.data);
        }
      } catch (error) {
        console.error('Failed to load move details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoveDetails();
  }, [selectedMove]);

  // Filter moves based on search and filters
  useEffect(() => {
    let moves = [...allMoves];

    // Filter by search query
    if (searchQuery) {
      moves = moves.filter((move) =>
        move.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Show Pokemon-learnable moves first if available
    if (pokemonMoves.length > 0) {
      const learnableMoves = moves.filter((move) => pokemonMoves.includes(move));
      const otherMoves = moves.filter((move) => !pokemonMoves.includes(move));
      moves = [...learnableMoves, ...otherMoves];
    }

    // Limit results to prevent performance issues
    setFilteredMoves(moves.slice(0, 100));
  }, [searchQuery, allMoves, pokemonMoves, filters]);

  const handleFilterChange = (field: keyof MoveSearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectMove = () => {
    if (selectedMove) {
      onSelectMove(selectedMove);
      onClose();
    }
  };

  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getMoveEffectText = (move: Move): string => {
    const englishEffect = move.effect_entries.find(
      (entry) => entry.language.name === 'en'
    );
    return englishEffect?.short_effect || 'No description available.';
  };

  const getMoveFlavorText = (move: Move): string => {
    const englishFlavor = move.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    );
    return englishFlavor?.flavor_text || '';
  };

  const getPowerDisplay = (power?: number): string => {
    if (!power) return '—';
    return power.toString();
  };

  const getAccuracyDisplay = (accuracy?: number): string => {
    if (!accuracy) return '—';
    return `${accuracy}%`;
  };

  const getDamageClassColor = (damageClass: string): 'error' | 'warning' | 'info' => {
    switch (damageClass) {
      case 'physical':
        return 'error';
      case 'special':
        return 'info';
      case 'status':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          <Typography variant="h6">Move Editor</Typography>
          {pokemonName && (
            <Chip 
              label={`For ${formatMoveName(pokemonName)}`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Search and Filters Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Search Moves"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />

              {/* Filters */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Filters</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        label="Type"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {types.map((type) => (
                          <MenuItem key={type} value={type}>
                            {formatMoveName(type)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        label="Category"
                      >
                        {MOVE_CATEGORIES.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Power</InputLabel>
                      <Select
                        value={filters.power}
                        onChange={(e) => handleFilterChange('power', e.target.value)}
                        label="Power"
                      >
                        {POWER_RANGES.map((range) => (
                          <MenuItem key={range.value} value={range.value}>
                            {range.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Accuracy</InputLabel>
                      <Select
                        value={filters.accuracy}
                        onChange={(e) => handleFilterChange('accuracy', e.target.value)}
                        label="Accuracy"
                      >
                        {ACCURACY_RANGES.map((range) => (
                          <MenuItem key={range.value} value={range.value}>
                            {range.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Move List */}
              <Autocomplete
                options={filteredMoves}
                value={selectedMove}
                onChange={(_, value) => setSelectedMove(value)}
                getOptionLabel={(move) => formatMoveName(move)}
                renderOption={(props, move) => (
                  <Box 
                    component="li" 
                    {...props} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <Typography>{formatMoveName(move)}</Typography>
                    {pokemonMoves.includes(move) && (
                      <Chip 
                        label="Learnable" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Move"
                    placeholder="Choose from the list..."
                  />
                )}
                ListboxProps={{
                  sx: { maxHeight: 300 }
                }}
              />

              {pokemonName && pokemonMoves.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Showing {pokemonMoves.filter(move => 
                      filteredMoves.includes(move)
                    ).length} learnable moves for {formatMoveName(pokemonName)}
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>

          {/* Move Details Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : moveDetails ? (
              <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {formatMoveName(moveDetails.name)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <PokemonTypeChip type={moveDetails.type.name} size="small" />
                    <Chip
                      label={formatMoveName(moveDetails.damage_class.name)}
                      size="small"
                      color={getDamageClassColor(moveDetails.damage_class.name)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Move Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      Power
                    </Typography>
                    <Typography variant="h6">
                      {getPowerDisplay(moveDetails.power)}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                    <Typography variant="h6">
                      {getAccuracyDisplay(moveDetails.accuracy)}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      PP
                    </Typography>
                    <Typography variant="h6">
                      {moveDetails.pp}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      Priority
                    </Typography>
                    <Typography variant="h6">
                      {moveDetails.priority > 0 ? `+${moveDetails.priority}` : moveDetails.priority}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                {/* Move Description */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="subtitle2">Effect</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {getMoveEffectText(moveDetails)}
                  </Typography>

                  {getMoveFlavorText(moveDetails) && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {getMoveFlavorText(moveDetails)}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Additional Move Data */}
                {moveDetails.meta && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Additional Info
                    </Typography>
                    <Grid container spacing={1}>
                      {moveDetails.meta.crit_rate > 0 && (
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            High crit ratio: {moveDetails.meta.crit_rate > 0 ? 'Yes' : 'No'}
                          </Typography>
                        </Grid>
                      )}
                      {moveDetails.meta.drain !== 0 && (
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            Drain: {moveDetails.meta.drain}%
                          </Typography>
                        </Grid>
                      )}
                      {moveDetails.meta.healing !== 0 && (
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            Healing: {moveDetails.meta.healing}%
                          </Typography>
                        </Grid>
                      )}
                      {moveDetails.effect_chance && (
                        <Grid size={6}>
                          <Typography variant="body2" color="text.secondary">
                            Effect Chance: {moveDetails.effect_chance}%
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a move to view detailed information
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSelectMove} 
          variant="contained" 
          disabled={!selectedMove}
        >
          Select Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveEditorDialog;