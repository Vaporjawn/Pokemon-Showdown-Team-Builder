import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,

  Chip,
  Paper,
  Tooltip,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { Pokemon } from '../types/pokemon';

interface SpriteViewerProps {
  open: boolean;
  onClose: () => void;
  pokemon: Pokemon | null;
}

type SpriteType = 
  | 'front_default'
  | 'front_shiny' 
  | 'front_female'
  | 'front_shiny_female'
  | 'back_default'
  | 'back_shiny'
  | 'back_female'
  | 'back_shiny_female';

type GenerationType = 'home' | 'official-artwork' | 'showdown' | 'dream_world';

interface SpriteInfo {
  name: string;
  displayName: string;
  description: string;
  category: 'Standard' | 'Shiny' | 'Female' | 'Shiny Female' | 'Back' | 'Special';
  isShiny: boolean;
  isFemale: boolean;
  isBack: boolean;
}

const SPRITE_INFO: Record<SpriteType, SpriteInfo> = {
  front_default: {
    name: 'front_default',
    displayName: 'Default Front',
    description: 'Standard front-facing sprite',
    category: 'Standard',
    isShiny: false,
    isFemale: false,
    isBack: false,
  },
  front_shiny: {
    name: 'front_shiny',
    displayName: 'Shiny Front',
    description: 'Shiny front-facing sprite with alternate coloration',
    category: 'Shiny',
    isShiny: true,
    isFemale: false,
    isBack: false,
  },
  front_female: {
    name: 'front_female',
    displayName: 'Female Front',
    description: 'Female front-facing sprite (for dimorphic species)',
    category: 'Female',
    isShiny: false,
    isFemale: true,
    isBack: false,
  },
  front_shiny_female: {
    name: 'front_shiny_female',
    displayName: 'Shiny Female Front',
    description: 'Shiny female front-facing sprite',
    category: 'Shiny Female',
    isShiny: true,
    isFemale: true,
    isBack: false,
  },
  back_default: {
    name: 'back_default',
    displayName: 'Default Back',
    description: 'Standard back-facing sprite',
    category: 'Back',
    isShiny: false,
    isFemale: false,
    isBack: true,
  },
  back_shiny: {
    name: 'back_shiny',
    displayName: 'Shiny Back',
    description: 'Shiny back-facing sprite with alternate coloration',
    category: 'Shiny',
    isShiny: true,
    isFemale: false,
    isBack: true,
  },
  back_female: {
    name: 'back_female',
    displayName: 'Female Back',
    description: 'Female back-facing sprite (for dimorphic species)',
    category: 'Female',
    isShiny: false,
    isFemale: true,
    isBack: true,
  },
  back_shiny_female: {
    name: 'back_shiny_female',
    displayName: 'Shiny Female Back',
    description: 'Shiny female back-facing sprite',
    category: 'Shiny Female',
    isShiny: true,
    isFemale: true,
    isBack: true,
  },
};

const GENERATION_INFO = {
  home: {
    name: 'Pokemon Home',
    description: 'High-quality official Pokemon Home sprites',
    priority: 1,
  },
  'official-artwork': {
    name: 'Official Artwork',
    description: 'Official Pokemon artwork and illustrations',
    priority: 2,
  },
  showdown: {
    name: 'Pokemon Showdown',
    description: 'Pokemon Showdown battle sprites',
    priority: 3,
  },
  dream_world: {
    name: 'Dream World',
    description: 'Pokemon Dream World artwork',
    priority: 4,
  },
};

export const SpriteViewer: React.FC<SpriteViewerProps> = ({ open, onClose, pokemon }) => {
  const [selectedGeneration, setSelectedGeneration] = useState<GenerationType>('official-artwork');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [selectedSprite, setSelectedSprite] = useState<string | null>(null);

  const availableSprites = useMemo(() => {
    if (!pokemon?.sprites) return [];

    const sprites: Array<{ type: SpriteType; url: string | null; info: SpriteInfo }> = [];
    
    // Add standard sprites - only use the main sprites object for now
    Object.entries(SPRITE_INFO).forEach(([key, info]) => {
      const spriteType = key as SpriteType;
      let url: string | null = null;
      
      // Get URL from main sprites object
      url = pokemon.sprites[spriteType] || null;

      sprites.push({
        type: spriteType,
        url,
        info,
      });
    });

    // Filter based on availability if requested
    if (showOnlyAvailable) {
      return sprites.filter(sprite => sprite.url);
    }

    return sprites;
  }, [pokemon, showOnlyAvailable]);

  const spritesByCategory = useMemo(() => {
    const categories: Record<string, typeof availableSprites> = {};
    
    availableSprites.forEach(sprite => {
      const category = sprite.info.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(sprite);
    });

    return categories;
  }, [availableSprites]);

  const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' => {
    switch (category) {
      case 'Shiny':
      case 'Shiny Female':
        return 'warning';
      case 'Female':
        return 'secondary';
      case 'Back':
        return 'primary';
      case 'Special':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleDownloadSprite = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pokemon?.name}-${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSpriteClick = (url: string) => {
    setSelectedSprite(url);
  };

  if (!pokemon) {
    return null;
  }

  const totalAvailable = availableSprites.filter(s => s.url).length;
  const totalPossible = Object.keys(SPRITE_INFO).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <ViewIcon color="primary" />
          <Typography variant="h6">
            Sprite Viewer - {pokemon.name}
          </Typography>
          <Chip 
            label={`${totalAvailable}/${totalPossible} available`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Generation and Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
            <Box flex={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Sprite Source</InputLabel>
                <Select
                  value={selectedGeneration}
                  label="Sprite Source"
                  onChange={(e) => setSelectedGeneration(e.target.value as GenerationType)}
                >
                  {Object.entries(GENERATION_INFO)
                    .sort(([,a], [,b]) => a.priority - b.priority)
                    .map(([key, info]) => (
                      <MenuItem key={key} value={key}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {info.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {info.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show only available sprites"
              />
            </Box>
          </Box>
        </Box>

        {totalAvailable === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No sprites available for {GENERATION_INFO[selectedGeneration].name}.
              Try selecting a different sprite source or disable the "Show only available" filter.
            </Typography>
          </Alert>
        ) : null}

        {/* Sprite Grid by Category */}
        {Object.entries(spritesByCategory).map(([category, sprites]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h6" color="text.secondary">
                {category}
              </Typography>
              <Chip 
                label={sprites.filter(s => s.url).length}
                size="small"
                color={getCategoryColor(category)}
                variant="outlined"
              />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {sprites.map((sprite) => (
                <Box key={sprite.type} sx={{ minWidth: { xs: '100%', sm: '300px', md: '280px' }, flex: '1 1 300px' }}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      opacity: sprite.url ? 1 : 0.5,
                      cursor: sprite.url ? 'pointer' : 'default',
                      '&:hover': sprite.url ? {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      } : {}
                    }}
                    onClick={() => sprite.url && handleSpriteClick(sprite.url)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      {/* Sprite Image */}
                      <Box 
                        sx={{ 
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 1,
                          position: 'relative'
                        }}
                      >
                        {sprite.url ? (
                          <>
                            <img
                              src={sprite.url}
                              alt={sprite.info.displayName}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {sprite.info.isShiny && (
                              <StarIcon
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  color: 'gold',
                                  fontSize: 16
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            No image available
                          </Typography>
                        )}
                      </Box>

                      {/* Sprite Info */}
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        {sprite.info.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        {sprite.info.description}
                      </Typography>

                      {/* Tags */}
                      <Box display="flex" gap={0.5} justifyContent="center" flexWrap="wrap" mb={2}>
                        {sprite.info.isShiny && (
                          <Chip label="Shiny" size="small" color="warning" variant="outlined" />
                        )}
                        {sprite.info.isFemale && (
                          <Chip label="Female" size="small" color="secondary" variant="outlined" />
                        )}
                        {sprite.info.isBack && (
                          <Chip label="Back" size="small" color="primary" variant="outlined" />
                        )}
                      </Box>

                      {/* Actions */}
                      {sprite.url && (
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Download sprite">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSprite(sprite.url!, sprite.type);
                              }}
                            >
                              Download
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        {/* Sprite Details */}
        {selectedSprite && (
          <Paper sx={{ p: 3, mt: 3, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Selected Sprite Preview
            </Typography>
            <Box display="flex" justifyContent="center" mb={2}>
              <img
                src={selectedSprite}
                alt="Selected sprite"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box display="flex" gap={1} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadSprite(selectedSprite, 'selected')}
              >
                Download Full Size
              </Button>
            </Box>
          </Paper>
        )}

        {/* Sprite Information */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            About Pokemon Sprites
          </Typography>
          <Typography variant="body2">
            • <strong>Official Artwork:</strong> High-quality official Pokemon illustrations
            <br />
            • <strong>Pokemon Home:</strong> Modern sprites used in Pokemon Home
            <br />
            • <strong>Shiny variants:</strong> Alternate color palettes (indicated with ⭐)
            <br />
            • <strong>Gender differences:</strong> Some Pokemon have different male/female appearances
            <br />
            • <strong>Back sprites:</strong> Used in battle scenarios where Pokemon faces away
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};