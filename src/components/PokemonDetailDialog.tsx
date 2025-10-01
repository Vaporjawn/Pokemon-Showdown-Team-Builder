import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  CatchingPokemon as PokemonIcon,
  Speed as SpeedIcon,
  Security as DefenseIcon,
  LocalFireDepartment as AttackIcon,
  Favorite as HPIcon,
  Psychology as PsychicIcon,
  Shield as SpecialDefenseIcon,
} from '@mui/icons-material';
import PokemonTypeChip from './PokemonTypeChip';
import { pokemonDataService } from '../services/pokemonDataService';
import type { Pokemon, PokemonSpecies, PokemonStat } from '../types/pokemon';

interface PokemonDetailDialogProps {
  pokemon: Pokemon;
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`pokemon-tabpanel-${index}`}
    aria-labelledby={`pokemon-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const StatIcon: React.FC<{ statName: string }> = ({ statName }) => {
  const iconProps = { fontSize: 'small' as const, sx: { mr: 1 } };

  switch (statName) {
    case 'hp': return <HPIcon {...iconProps} color="error" />;
    case 'attack': return <AttackIcon {...iconProps} color="warning" />;
    case 'defense': return <DefenseIcon {...iconProps} color="info" />;
    case 'special-attack': return <PsychicIcon {...iconProps} color="secondary" />;
    case 'special-defense': return <SpecialDefenseIcon {...iconProps} color="primary" />;
    case 'speed': return <SpeedIcon {...iconProps} color="success" />;
    default: return <PokemonIcon {...iconProps} />;
  }
};

const getStatColor = (statName: string): string => {
  switch (statName) {
    case 'hp': return '#f44336';
    case 'attack': return '#ff9800';
    case 'defense': return '#2196f3';
    case 'special-attack': return '#9c27b0';
    case 'special-defense': return '#3f51b5';
    case 'speed': return '#4caf50';
    default: return '#666';
  }
};

const formatStatName = (statName: string): string => {
  return statName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PokemonDetailDialog: React.FC<PokemonDetailDialogProps> = ({ pokemon, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Load species data when pokemon changes
  useEffect(() => {
    if (!pokemon || !open) return;

    const loadSpecies = async () => {
      try {
        setLoadingSpecies(true);
        setSpeciesError(null);

        const speciesResponse = await pokemonDataService.getPokemonSpecies(pokemon.name);
        if (speciesResponse.success && speciesResponse.data) {
          setSpecies(speciesResponse.data);
        } else {
          setSpeciesError('Failed to load Pokemon details');
        }
      } catch (err) {
        setSpeciesError('Error loading Pokemon details');
        console.error('Error loading species:', err);
      } finally {
        setLoadingSpecies(false);
      }
    };

    loadSpecies();
  }, [pokemon, open]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTabValue(0);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [open]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getFlavorText = (): string => {
    if (!species?.flavor_text_entries) return 'No description available.';

    // Try to find English flavor text from latest games
    const englishEntries = species.flavor_text_entries.filter(entry =>
      entry.language.name === 'en'
    );

    if (englishEntries.length === 0) return 'No description available.';

    // Get the most recent entry
    return englishEntries[englishEntries.length - 1].flavor_text
      .replace(/\f/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const maxStat = Math.max(...pokemon.stats.map(stat => stat.base_stat));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              textTransform: 'capitalize',
              fontWeight: 700,
              mr: 2,
            }}
          >
            {pokemon.name}
          </Typography>
          <Chip
            label={`#${pokemon.id.toString().padStart(3, '0')}`}
            color="primary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Main Pokemon Info */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 200,
                  position: 'relative',
                }}
              >
                {!imageLoaded && !imageError && pokemon.sprites.front_default && (
                  <Skeleton variant="circular" width={180} height={180} />
                )}

                {imageError || !pokemon.sprites.front_default ? (
                  <Avatar
                    sx={{
                      width: 180,
                      height: 180,
                      bgcolor: 'primary.light',
                      fontSize: '4rem',
                    }}
                  >
                    <PokemonIcon fontSize="large" />
                  </Avatar>
                ) : (
                  <img
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    style={{
                      width: 180,
                      height: 180,
                      objectFit: 'contain',
                      display: imageLoaded ? 'block' : 'none',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                    }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {/* Pokemon Types */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Types
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pokemon.types.map((typeInfo) => (
                    <PokemonTypeChip
                      key={typeInfo.type.name}
                      type={typeInfo.type.name}
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>

              {/* Physical Stats */}
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {pokemon.height / 10}m
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Height
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {pokemon.weight / 10}kg
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Weight
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Pokemon Description */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                {loadingSpecies ? (
                  <Box>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ) : speciesError ? (
                  <Alert severity="warning">
                    {speciesError}
                  </Alert>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {getFlavorText()}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Stats" />
            <Tab label="Abilities" />
            <Tab label="Moves" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* Stats Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Base Stats
            </Typography>
            <Grid container spacing={2}>
              {pokemon.stats.map((stat: PokemonStat) => (
                <Grid key={stat.stat.name} size={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StatIcon statName={stat.stat.name} />
                        <Typography variant="body1" fontWeight="medium">
                          {formatStatName(stat.stat.name)}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {stat.base_stat}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.base_stat / maxStat) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStatColor(stat.stat.name),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Total Stats */}
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Base Stat Points
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Abilities Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Abilities
            </Typography>
            <Grid container spacing={2}>
              {pokemon.abilities.map((abilityInfo) => (
                <Grid key={abilityInfo.ability.name} size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: abilityInfo.is_hidden ? 'warning.light' : 'background.paper',
                      border: abilityInfo.is_hidden ? 2 : 1,
                      borderColor: abilityInfo.is_hidden ? 'warning.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ textTransform: 'capitalize', mr: 1 }}
                        >
                          {abilityInfo.ability.name.replace('-', ' ')}
                        </Typography>
                        {abilityInfo.is_hidden && (
                          <Chip
                            label="Hidden"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Slot {abilityInfo.slot}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Moves Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Moves ({pokemon.moves.length} total)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This Pokémon can learn {pokemon.moves.length} different moves through various methods.
            </Typography>

            <Grid container spacing={1}>
              {pokemon.moves.slice(0, 20).map((moveInfo) => (
                <Grid key={moveInfo.move.name} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Chip
                    label={moveInfo.move.name.replace('-', ' ')}
                    variant="outlined"
                    sx={{
                      textTransform: 'capitalize',
                      width: '100%',
                      justifyContent: 'flex-start',
                    }}
                  />
                </Grid>
              ))}
              {pokemon.moves.length > 20 && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    ... and {pokemon.moves.length - 20} more moves
                  </Typography>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PokemonDetailDialog;
