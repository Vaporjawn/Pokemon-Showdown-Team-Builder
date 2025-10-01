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
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Remove as NeutralIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/dataService';
import type { Nature } from '../types/pokemon';

interface NatureEditorProps {
  open: boolean;
  onClose: () => void;
  onSelectNature: (natureName: string) => void;
  currentNature?: string;
}

interface NatureData {
  name: string;
  displayName: string;
  increasedStat: string | null;
  decreasedStat: string | null;
  hatesFlavor: string | null;
  likesFlavor: string | null;
}

const NatureEditor: React.FC<NatureEditorProps> = ({
  open,
  onClose,
  onSelectNature,
  currentNature,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [natures, setNatures] = useState<NatureData[]>([]);
  const [filteredNatures, setFilteredNatures] = useState<NatureData[]>([]);
  const [selectedNature, setSelectedNature] = useState<NatureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processNatureData = useCallback((nature: Nature): NatureData => {
    return {
      name: nature.name,
      displayName: formatNatureName(nature.name),
      increasedStat: nature.increased_stat?.name || null,
      decreasedStat: nature.decreased_stat?.name || null,
      hatesFlavor: nature.hates_flavor?.name || null,
      likesFlavor: nature.likes_flavor?.name || null,
    };
  }, []);

  const loadNaturesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get nature names from the data service
      const natureNames = pokemonDataService.getAllNatures(); // Get all natures
      const naturesData: NatureData[] = [];

      for (const natureName of natureNames) {
        try {
          const nature = pokemonDataService.getNature(natureName);
          if (nature) {
            const natureData = processNatureData(nature);
            naturesData.push(natureData);
          }
        } catch (err) {
          console.warn(`Failed to load nature ${natureName}:`, err);
        }
      }

      // Sort natures alphabetically
      naturesData.sort((a, b) => a.displayName.localeCompare(b.displayName));

      setNatures(naturesData);
      setFilteredNatures(naturesData);
    } catch (err) {
      setError('Failed to load natures data. Please try again.');
      console.error('Error loading natures:', err);
    } finally {
      setLoading(false);
    }
  }, [processNatureData]);

  // Load natures data when dialog opens
  useEffect(() => {
    if (open) {
      loadNaturesData();
    }
  }, [open, loadNaturesData]);

  // Filter natures when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = natures.filter(nature =>
        nature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nature.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nature.increasedStat && formatStatName(nature.increasedStat).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (nature.decreasedStat && formatStatName(nature.decreasedStat).toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredNatures(filtered);
    } else {
      setFilteredNatures(natures);
    }
  }, [searchQuery, natures]);

  const formatNatureName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatStatName = (stat: string): string => {
    switch (stat) {
      case 'attack':
        return 'Attack';
      case 'defense':
        return 'Defense';
      case 'special-attack':
        return 'Sp. Attack';
      case 'special-defense':
        return 'Sp. Defense';
      case 'speed':
        return 'Speed';
      case 'hp':
        return 'HP';
      default:
        return stat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };



  const getNatureEffect = (nature: NatureData): string => {
    if (!nature.increasedStat && !nature.decreasedStat) {
      return 'No stat changes';
    }

    if (!nature.increasedStat || !nature.decreasedStat) {
      return 'No stat changes';
    }

    if (nature.increasedStat === nature.decreasedStat) {
      return 'No stat changes';
    }

    return `+${formatStatName(nature.increasedStat)}, -${formatStatName(nature.decreasedStat)}`;
  };

  const isNeutralNature = (nature: NatureData): boolean => {
    return !nature.increasedStat || 
           !nature.decreasedStat || 
           nature.increasedStat === nature.decreasedStat;
  };

  const handleNatureSelect = (nature: NatureData) => {
    setSelectedNature(nature);
  };

  const handleConfirmSelection = () => {
    if (selectedNature) {
      onSelectNature(selectedNature.name);
      onClose();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Group natures by their effect type
  const neutralNatures = filteredNatures.filter(isNeutralNature);
  const modifyingNatures = filteredNatures.filter(nature => !isNeutralNature(nature));

  // Group modifying natures by increased stat
  const naturesByIncreasedStat = modifyingNatures.reduce((acc, nature) => {
    if (nature.increasedStat) {
      const statKey = nature.increasedStat;
      if (!acc[statKey]) {
        acc[statKey] = [];
      }
      acc[statKey].push(nature);
    }
    return acc;
  }, {} as Record<string, NatureData[]>);

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
          <Typography variant="h6">Nature Editor</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 0 }}>
        {/* Search Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search natures by name or stat effects..."
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
              Loading natures...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Natures List */}
            <Box sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }}>
              <List sx={{ height: '100%', overflow: 'auto' }}>
                {/* Neutral Natures */}
                {neutralNatures.length > 0 && (
                  <Box>
                    <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Neutral Natures ({neutralNatures.length})
                      </Typography>
                    </Box>
                    {neutralNatures.map((nature) => (
                      <ListItem key={nature.name} disablePadding>
                        <ListItemButton
                          selected={selectedNature?.name === nature.name}
                          onClick={() => handleNatureSelect(nature)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <NeutralIcon color="action" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <ListItemText
                                primary={nature.displayName}
                                secondary="No stat changes"
                              />
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <Divider />
                  </Box>
                )}

                {/* Stat-Modifying Natures */}
                {Object.entries(naturesByIncreasedStat).map(([stat, statNatures]) => (
                  <Box key={stat}>
                    <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        +{formatStatName(stat)} ({statNatures.length})
                      </Typography>
                    </Box>
                    {statNatures.map((nature) => (
                      <ListItem key={nature.name} disablePadding>
                        <ListItemButton
                          selected={selectedNature?.name === nature.name}
                          onClick={() => handleNatureSelect(nature)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <UpIcon color="success" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {nature.displayName}
                                    </Typography>
                                    <Chip
                                      label={`-${formatStatName(nature.decreasedStat!)}`}
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      icon={<DownIcon />}
                                    />
                                  </Box>
                                }
                                secondary={getNatureEffect(nature)}
                              />
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <Divider />
                  </Box>
                ))}

                {filteredNatures.length === 0 && !loading && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'No natures found matching your search.' : 'No natures available.'}
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>

            {/* Nature Details */}
            <Box sx={{ width: '50%', p: 2, display: 'flex', flexDirection: 'column' }}>
              {selectedNature ? (
                <Fade in={true}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {selectedNature.displayName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Internal Name: {selectedNature.name}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                      Stat Modifications
                    </Typography>

                    {isNeutralNature(selectedNature) ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This nature provides no stat modifications.
                      </Alert>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1, p: 2, border: 1, borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <UpIcon color="success" />
                            <Typography variant="subtitle2" color="success.main">
                              Increased
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {formatStatName(selectedNature.increasedStat!)} (+10%)
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 2, border: 1, borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DownIcon color="error" />
                            <Typography variant="subtitle2" color="error.main">
                              Decreased
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {formatStatName(selectedNature.decreasedStat!)} (-10%)
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {selectedNature.likesFlavor && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                          Berry Preferences
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={`Likes ${selectedNature.likesFlavor}`}
                            color="success"
                            variant="outlined"
                          />
                          {selectedNature.hatesFlavor && (
                            <Chip
                              label={`Hates ${selectedNature.hatesFlavor}`}
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {currentNature && currentNature === selectedNature.name && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This is the currently selected nature.
                      </Alert>
                    )}

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Tip:</strong> Natures affect a Pokémon's stats by +10% to one stat and -10% to another. 
                        Choose a nature that benefits your Pokémon's role in battle.
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <VisibilityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    Select a nature to view its stat effects
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Natures modify stats by +10% and -10%
                  </Typography>
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
          disabled={!selectedNature}
        >
          Select Nature
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NatureEditor;