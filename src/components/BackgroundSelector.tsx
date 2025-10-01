import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon,
  Star as StarIcon,
  Landscape as LandscapeIcon,
  FlashOn as FlashIcon,
} from '@mui/icons-material';
import { useThemeStore, POKEMON_BACKGROUNDS, type PokemonBackground } from '../stores/themeStore';

interface BackgroundPreviewCardProps {
  background: PokemonBackground;
  isSelected: boolean;
  onSelect: () => void;
}

const BackgroundPreviewCard: React.FC<BackgroundPreviewCardProps> = ({
  background,
  isSelected,
  onSelect,
}) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: isSelected ? 3 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 4,
        },
        overflow: 'hidden',
        height: '120px',
      }}
      onClick={onSelect}
    >
      {/* Background Preview */}
      <Box
        sx={{
          height: '70px',
          background: background.backgroundGradient || background.backgroundColor || '#f5f5f5',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Sample card overlay */}
        <Box
          sx={{
            width: '60px',
            height: '35px',
            background: background.cardBackdrop,
            borderRadius: 1,
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: background.textColor === '#ffffff' ? '#333' : background.textColor,
              fontSize: '8px',
              fontWeight: 'bold',
            }}
          >
            CARD
          </Typography>
        </Box>

        {/* Selection indicator */}
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 1, height: '50px' }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
          {background.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: '0.7rem',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {background.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const BackgroundSelector: React.FC = () => {
  const {
    showBackgroundSelector,
    currentBackground,
    setShowBackgroundSelector,
    setBackground
  } = useThemeStore();

  const [activeTab, setActiveTab] = React.useState(0);

  const categories = [
    { key: 'generation', label: 'Generations', icon: <StarIcon /> },
    { key: 'legendary', label: 'Legendary', icon: <FlashIcon /> },
    { key: 'special', label: 'Special', icon: <LandscapeIcon /> },
  ];

  const filteredBackgrounds = POKEMON_BACKGROUNDS.filter(
    bg => bg.category === categories[activeTab].key
  );

  const handleBackgroundSelect = (background: PokemonBackground) => {
    setBackground(background);
  };

  const handleClose = () => {
    setShowBackgroundSelector(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={showBackgroundSelector}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon color="primary" />
            <Typography variant="h5">Choose Background Theme</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select a Pokemon Showdown inspired theme for your team builder
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mt: 2 }}>
          {categories.map((category) => (
            <Tab
              key={category.key}
              label={category.label}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {filteredBackgrounds.map((background) => (
              <Grid key={background.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BackgroundPreviewCard
                  background={background}
                  isSelected={currentBackground.id === background.id}
                  onSelect={() => handleBackgroundSelect(background)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Current selection info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Theme: {currentBackground.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentBackground.description}
          </Typography>
          <Chip
            label={currentBackground.category.charAt(0).toUpperCase() + currentBackground.category.slice(1)}
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ ml: 1 }}
        >
          Apply Theme
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BackgroundSelector;
