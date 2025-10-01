import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Box,
  Switch,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Casino, Psychology } from '@mui/icons-material';
import type { RandomTeamOptions } from '../utils/randomTeamGenerator';
import { useTeamStore } from '../stores/teamStore';

interface RandomTeamDialogProps {
  open: boolean;
  onClose: () => void;
}

const GENERATION_OPTIONS = [
  { value: 1, label: 'Generation 1 (Red/Blue/Yellow)' },
  { value: 2, label: 'Generation 2 (Gold/Silver/Crystal)' },
  { value: 3, label: 'Generation 3 (Ruby/Sapphire/Emerald)' },
  { value: 4, label: 'Generation 4 (Diamond/Pearl/Platinum)' },
  { value: 5, label: 'Generation 5 (Black/White)' },
  { value: 6, label: 'Generation 6 (X/Y)' },
  { value: 7, label: 'Generation 7 (Sun/Moon)' },
  { value: 8, label: 'Generation 8 (Sword/Shield)' },
  { value: 9, label: 'Generation 9 (Scarlet/Violet)' },
];

const FORMAT_OPTIONS = [
  { value: '', label: 'Any Format' },
  { value: 'OU', label: 'OU (Over Used)' },
  { value: 'UU', label: 'UU (Under Used)' },
  { value: 'RU', label: 'RU (Rarely Used)' },
  { value: 'NU', label: 'NU (Never Used)' },
  { value: 'LC', label: 'LC (Little Cup)' },
  { value: 'Uber', label: 'Uber' },
];

export const RandomTeamDialog: React.FC<RandomTeamDialogProps> = ({ open, onClose }) => {
  const { generateRandomTeam, isLoading } = useTeamStore();
  const [options, setOptions] = useState<RandomTeamOptions>({
    mode: 'competitive',
    generation: 9,
    format: 'OU',
    allowLegendaries: false,
    allowUnevolved: false,
  });

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({
      ...prev,
      mode: event.target.value as 'competitive' | 'chaos',
    }));
  };

  const handleGenerationChange = (event: { target: { value: unknown } }) => {
    setOptions(prev => ({
      ...prev,
      generation: Number(event.target.value),
    }));
  };

  const handleFormatChange = (event: { target: { value: unknown } }) => {
    setOptions(prev => ({
      ...prev,
      format: String(event.target.value),
    }));
  };

  const handleSwitchChange = (field: keyof RandomTeamOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleGenerate = async () => {
    try {
      await generateRandomTeam(options);
      onClose();
    } catch (error) {
      console.error('Failed to generate random team:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="random-team-dialog-title"
    >
      <DialogTitle id="random-team-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <Casino />
          Generate Random Team
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Mode Selection */}
          <FormControl component="fieldset">
            <FormLabel component="legend">
              <Typography variant="h6" gutterBottom>
                Generation Mode
              </Typography>
            </FormLabel>
            <RadioGroup
              row
              name="mode"
              value={options.mode}
              onChange={handleModeChange}
            >
              <FormControlLabel
                value="competitive"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Psychology />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Competitive
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Viable movesets, items, and spreads
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="chaos"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Casino />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Chaos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completely random everything
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* Generation Selection */}
          <FormControl fullWidth>
            <FormLabel>
              <Typography variant="subtitle1" gutterBottom>
                Pokémon Generation
              </Typography>
            </FormLabel>
            <Select
              value={options.generation || ''}
              onChange={handleGenerationChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>Any Generation</em>
              </MenuItem>
              {GENERATION_OPTIONS.map((gen) => (
                <MenuItem key={gen.value} value={gen.value}>
                  {gen.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Format Selection (Competitive Mode Only) */}
          {options.mode === 'competitive' && (
            <FormControl fullWidth>
              <FormLabel>
                <Typography variant="subtitle1" gutterBottom>
                  Competitive Format
                </Typography>
              </FormLabel>
              <Select
                value={options.format || ''}
                onChange={handleFormatChange}
                displayEmpty
              >
                {FORMAT_OPTIONS.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Advanced Options */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Advanced Options
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={options.allowLegendaries || false}
                    onChange={handleSwitchChange('allowLegendaries')}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Allow Legendary Pokémon
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Include legendary and mythical Pokémon
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={options.allowUnevolved || false}
                    onChange={handleSwitchChange('allowUnevolved')}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Allow Unevolved Pokémon
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Include Pokémon that can still evolve
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          {/* Preview Tags */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Preview Settings
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={options.mode === 'competitive' ? 'Competitive' : 'Chaos'}
                color={options.mode === 'competitive' ? 'primary' : 'secondary'}
                size="small"
              />
              {options.generation && (
                <Chip
                  label={`Gen ${options.generation}`}
                  variant="outlined"
                  size="small"
                />
              )}
              {options.format && options.mode === 'competitive' && (
                <Chip
                  label={options.format}
                  variant="outlined"
                  size="small"
                />
              )}
              {options.allowLegendaries && (
                <Chip
                  label="Legendaries OK"
                  color="warning"
                  size="small"
                />
              )}
              {options.allowUnevolved && (
                <Chip
                  label="Unevolved OK"
                  color="info"
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <Casino />
          }
        >
          {isLoading ? 'Generating...' : 'Generate Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RandomTeamDialog;
