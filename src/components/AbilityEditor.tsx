import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/dataService';
import type { Ability } from '../types/pokemon';

interface AbilityEditorProps {
  open: boolean;
  onClose: () => void;
  onSelectAbility: (abilityName: string) => void;
  pokemonName?: string;
  currentAbility?: string;
}

interface AbilityData {
  name: string;
  displayName: string;
  description: string;
  shortDescription: string;
  isHidden: boolean;
  generation: number;
}

const AbilityEditor: React.FC<AbilityEditorProps> = ({
  open,
  onClose,
  onSelectAbility,
  pokemonName,
  currentAbility,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [abilities, setAbilities] = useState<AbilityData[]>([]);
  const [filteredAbilities, setFilteredAbilities] = useState<AbilityData[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<AbilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pokemonAbilities, setPokemonAbilities] = useState<string[]>([]);

  const processAbilityData = useCallback(async (ability: Ability): Promise<AbilityData> => {
    // Get English description
    const englishEffect = ability.effect_entries.find(
      entry => entry.language.name === 'en'
    );
    const englishFlavorText = ability.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );

    const description = englishEffect?.effect || 'No description available.';
    const shortDescription = englishEffect?.short_effect || englishFlavorText?.flavor_text || description;

    return {
      name: ability.name,
      displayName: formatAbilityName(ability.name),
      description: description,
      shortDescription: shortDescription,
      isHidden: false, // Will be determined per Pokemon
      generation: ability.generation ? parseInt(ability.generation.url.split('/')[6]) : 1,
    };
  }, []);

  const loadAbilitiesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get ability names from the data service
      const abilityNames = pokemonDataService.searchAbilities('').slice(0, 50); // Load first 50 abilities
      const abilitiesData: AbilityData[] = [];

      for (const abilityName of abilityNames) {
        try {
          const ability = await pokemonDataService.getAbility(abilityName);
          if (ability) {
            const abilityData = await processAbilityData(ability);
            abilitiesData.push(abilityData);
          }
        } catch (err) {
          console.warn(`Failed to load ability ${abilityName}:`, err);
        }
      }

      setAbilities(abilitiesData);
      setFilteredAbilities(abilitiesData);
    } catch (err) {
      setError('Failed to load abilities data. Please try again.');
      console.error('Error loading abilities:', err);
    } finally {
      setLoading(false);
    }
  }, [processAbilityData]);

  const loadPokemonAbilities = useCallback(async () => {
    if (!pokemonName) return;

    try {
      const pokemon = await pokemonDataService.getPokemon(pokemonName);
      if (pokemon && pokemon.abilities) {
        const abilityNames = pokemon.abilities.map(a => a.ability.name);
        setPokemonAbilities(abilityNames);
      }
    } catch (err) {
      console.warn(`Failed to load abilities for ${pokemonName}:`, err);
    }
  }, [pokemonName]);

  // Load abilities data when dialog opens
  useEffect(() => {
    if (open) {
      loadAbilitiesData();
      if (pokemonName) {
        loadPokemonAbilities();
      }
    }
  }, [open, pokemonName, loadAbilitiesData, loadPokemonAbilities]);

  // Filter abilities when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = abilities.filter(ability =>
        ability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ability.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ability.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAbilities(filtered);
    } else {
      setFilteredAbilities(abilities);
    }
  }, [searchQuery, abilities]);

  const formatAbilityName = (name: string): string => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAbilitySelect = (ability: AbilityData) => {
    setSelectedAbility(ability);
  };

  const handleConfirmSelection = () => {
    if (selectedAbility) {
      onSelectAbility(selectedAbility.name);
      onClose();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const isAbilityForPokemon = (abilityName: string): boolean => {
    return pokemonAbilities.includes(abilityName);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Ability Editor
            {pokemonName && (
              <Typography variant="subtitle2" color="text.secondary">
                for {formatAbilityName(pokemonName)}
              </Typography>
            )}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 0 }}>
        {/* Search Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search abilities by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading abilities...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Abilities List */}
            <Box sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }}>
              <List sx={{ height: '100%', overflow: 'auto' }}>
                {pokemonName && pokemonAbilities.length > 0 && (
                  <>
                    <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      <Typography variant="subtitle2">
                        Natural Abilities for {formatAbilityName(pokemonName)}
                      </Typography>
                    </Box>
                    {filteredAbilities
                      .filter(ability => isAbilityForPokemon(ability.name))
                      .map((ability) => (
                        <ListItem key={ability.name} disablePadding>
                          <ListItemButton
                            selected={selectedAbility?.name === ability.name}
                            onClick={() => handleAbilitySelect(ability)}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1">
                                    {ability.displayName}
                                  </Typography>
                                  <StarIcon color="primary" fontSize="small" />
                                </Box>
                              }
                              secondary={ability.shortDescription.substring(0, 100) + '...'}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    <Divider />
                  </>
                )}

                {filteredAbilities
                  .filter(ability => !pokemonName || !isAbilityForPokemon(ability.name))
                  .map((ability) => (
                    <ListItem key={ability.name} disablePadding>
                      <ListItemButton
                        selected={selectedAbility?.name === ability.name}
                        onClick={() => handleAbilitySelect(ability)}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                {ability.displayName}
                              </Typography>
                              <Chip
                                label={`Gen ${ability.generation}`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={ability.shortDescription.substring(0, 100) + '...'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}

                {filteredAbilities.length === 0 && !loading && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'No abilities found matching your search.' : 'No abilities available.'}
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>

            {/* Ability Details */}
            <Box sx={{ width: '50%', p: 2, display: 'flex', flexDirection: 'column' }}>
              {selectedAbility ? (
                <Fade in={true}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h6">
                        {selectedAbility.displayName}
                      </Typography>
                      {isAbilityForPokemon(selectedAbility.name) && (
                        <Chip
                          icon={<StarIcon />}
                          label="Natural"
                          color="primary"
                          size="small"
                        />
                      )}
                      <Chip
                        label={`Generation ${selectedAbility.generation}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Internal Name: {selectedAbility.name}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {selectedAbility.description}
                    </Typography>

                    {currentAbility && currentAbility === selectedAbility.name && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This is the currently selected ability.
                      </Alert>
                    )}
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <VisibilityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    Select an ability to view its details
                  </Typography>
                  {pokemonName && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      Abilities marked with a star are natural to {formatAbilityName(pokemonName)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirmSelection}
          disabled={!selectedAbility}
        >
          Select Ability
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AbilityEditor;