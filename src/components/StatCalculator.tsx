import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Slider,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Tooltip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Info as InfoIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Remove as NeutralIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/dataService';
import type { Pokemon } from '../types/pokemon';

interface StatCalculatorProps {
  open: boolean;
  onClose: () => void;
  pokemon: Pokemon | null;
}

interface StatData {
  name: string;
  displayName: string;
  baseStat: number;
  iv: number;
  ev: number;
  natureMultiplier: number;
  finalStat: number;
}

interface NatureData {
  name: string;
  increasedStat: string | null;
  decreasedStat: string | null;
}

const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

export const StatCalculator: React.FC<StatCalculatorProps> = ({
  open,
  onClose,
  pokemon,
}) => {
  const [level, setLevel] = useState<number>(50);
  const [ivs, setIvs] = useState<Record<string, number>>({
    hp: 31,
    attack: 31,
    defense: 31,
    'special-attack': 31,
    'special-defense': 31,
    speed: 31,
  });
  const [evs, setEvs] = useState<Record<string, number>>({
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  });
  const [selectedNature, setSelectedNature] = useState<string>('hardy');
  const [natureData, setNatureData] = useState<NatureData | null>(null);
  const [natures, setNatures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load natures on component mount
  useEffect(() => {
    const loadNatures = async () => {
      try {
        const naturesData = pokemonDataService.getAllNatures();
        setNatures(naturesData);
      } catch (err) {
        console.error('Failed to load natures:', err);
        setError('Failed to load nature data');
      }
    };

    if (open) {
      loadNatures();
    }
  }, [open]);

  // Load selected nature data
  useEffect(() => {
    const loadNatureData = async () => {
      try {
        const nature = await pokemonDataService.getNature(selectedNature);
        if (nature) {
          setNatureData({
            name: nature.name,
            increasedStat: nature.increased_stat?.name || null,
            decreasedStat: nature.decreased_stat?.name || null,
          });
        }
      } catch (err) {
        console.error('Failed to load nature data:', err);
        setNatureData(null);
      }
    };

    if (selectedNature) {
      loadNatureData();
    }
  }, [selectedNature]);

  // Reset values when Pokemon changes
  useEffect(() => {
    if (pokemon) {
      // Reset EVs but keep IVs and level
      setEvs({
        hp: 0,
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0,
      });
    }
  }, [pokemon]);

  const totalEvs = useMemo(() => {
    return Object.values(evs).reduce((sum, ev) => sum + ev, 0);
  }, [evs]);

  const getNatureMultiplier = useCallback((statName: string): number => {
    if (!natureData) return 1.0;
    
    if (natureData.increasedStat === statName) return 1.1;
    if (natureData.decreasedStat === statName) return 0.9;
    return 1.0;
  }, [natureData]);

  const calculateStat = useCallback((statName: string, baseStat: number): number => {
    const iv = ivs[statName];
    const ev = evs[statName];
    const natureMultiplier = getNatureMultiplier(statName);

    if (statName === 'hp') {
      // HP calculation is different
      if (baseStat === 1) return 1; // Shedinja case
      return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      // Other stats calculation
      const baseStat_ = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
      return Math.floor(baseStat_ * natureMultiplier);
    }
  }, [ivs, evs, level, getNatureMultiplier]);

  const statData: StatData[] = useMemo(() => {
    if (!pokemon) return [];

    return pokemon.stats.map(stat => ({
      name: stat.stat.name,
      displayName: STAT_NAMES[stat.stat.name] || stat.stat.name,
      baseStat: stat.base_stat,
      iv: ivs[stat.stat.name],
      ev: evs[stat.stat.name],
      natureMultiplier: getNatureMultiplier(stat.stat.name),
      finalStat: calculateStat(stat.stat.name, stat.base_stat),
    }));
  }, [pokemon, ivs, evs, calculateStat, getNatureMultiplier]);

  const handleIvChange = (statName: string, value: number) => {
    setIvs(prev => ({ ...prev, [statName]: value }));
  };

  const handleEvChange = (statName: string, value: number) => {
    const newEvs = { ...evs, [statName]: value };
    const newTotal = Object.values(newEvs).reduce((sum, ev) => sum + ev, 0);
    
    // Don't allow total EVs to exceed 510
    if (newTotal <= 510) {
      setEvs(newEvs);
    }
  };

  const setPresetIvs = (preset: 'perfect' | 'zero' | 'mixed') => {
    switch (preset) {
      case 'perfect':
        setIvs({
          hp: 31,
          attack: 31,
          defense: 31,
          'special-attack': 31,
          'special-defense': 31,
          speed: 31,
        });
        break;
      case 'zero':
        setIvs({
          hp: 0,
          attack: 0,
          defense: 0,
          'special-attack': 0,
          'special-defense': 0,
          speed: 0,
        });
        break;
      case 'mixed':
        setIvs({
          hp: 31,
          attack: 0, // Physical attackers might want 0 attack to reduce confusion damage
          defense: 31,
          'special-attack': 31,
          'special-defense': 31,
          speed: 31,
        });
        break;
    }
  };

  const setPresetEvs = (preset: 'reset' | 'hp-attack' | 'hp-spatk' | 'speed-attack' | 'speed-spatk') => {
    switch (preset) {
      case 'reset':
        setEvs({
          hp: 0,
          attack: 0,
          defense: 0,
          'special-attack': 0,
          'special-defense': 0,
          speed: 0,
        });
        break;
      case 'hp-attack':
        setEvs({
          hp: 252,
          attack: 252,
          defense: 0,
          'special-attack': 0,
          'special-defense': 0,
          speed: 4,
        });
        break;
      case 'hp-spatk':
        setEvs({
          hp: 252,
          attack: 0,
          defense: 0,
          'special-attack': 252,
          'special-defense': 0,
          speed: 4,
        });
        break;
      case 'speed-attack':
        setEvs({
          hp: 4,
          attack: 252,
          defense: 0,
          'special-attack': 0,
          'special-defense': 0,
          speed: 252,
        });
        break;
      case 'speed-spatk':
        setEvs({
          hp: 4,
          attack: 0,
          defense: 0,
          'special-attack': 252,
          'special-defense': 0,
          speed: 252,
        });
        break;
    }
  };

  const getNatureIcon = (statName: string) => {
    if (!natureData) return <NeutralIcon color="disabled" fontSize="small" />;
    
    if (natureData.increasedStat === statName) {
      return <UpIcon color="success" fontSize="small" />;
    }
    if (natureData.decreasedStat === statName) {
      return <DownIcon color="error" fontSize="small" />;
    }
    return <NeutralIcon color="disabled" fontSize="small" />;
  };

  const getNatureColor = (statName: string): 'success' | 'error' | 'default' => {
    if (!natureData) return 'default';
    
    if (natureData.increasedStat === statName) return 'success';
    if (natureData.decreasedStat === statName) return 'error';
    return 'default';
  };

  if (!pokemon) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Stat Calculator</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Please select a Pokémon first to calculate its stats.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculatorIcon />
          Stat Calculator - {pokemon.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Parameters
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Level"
              type="number"
              value={level}
              onChange={(e) => setLevel(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: 100 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Nature</InputLabel>
              <Select
                value={selectedNature}
                onChange={(e) => setSelectedNature(e.target.value)}
                label="Nature"
              >
                {natures.map(nature => (
                  <MenuItem key={nature} value={nature}>
                    {nature.charAt(0).toUpperCase() + nature.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total EVs: {totalEvs}/510
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip 
                  label="Reset EVs" 
                  size="small" 
                  onClick={() => setPresetEvs('reset')}
                  variant="outlined"
                />
                <Chip 
                  label="HP/Atk" 
                  size="small" 
                  onClick={() => setPresetEvs('hp-attack')}
                  variant="outlined"
                />
                <Chip 
                  label="HP/SpA" 
                  size="small" 
                  onClick={() => setPresetEvs('hp-spatk')}
                  variant="outlined"
                />
                <Chip 
                  label="Spe/Atk" 
                  size="small" 
                  onClick={() => setPresetEvs('speed-attack')}
                  variant="outlined"
                />
                <Chip 
                  label="Spe/SpA" 
                  size="small" 
                  onClick={() => setPresetEvs('speed-spatk')}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              IV Presets:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="Perfect (31/31/31/31/31/31)" 
                size="small" 
                onClick={() => setPresetIvs('perfect')}
                variant="outlined"
              />
              <Chip 
                label="Zero (0/0/0/0/0/0)" 
                size="small" 
                onClick={() => setPresetIvs('zero')}
                variant="outlined"
              />
              <Chip 
                label="Mixed (31/0/31/31/31/31)" 
                size="small" 
                onClick={() => setPresetIvs('mixed')}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Stat Calculation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Stat</TableCell>
                <TableCell align="center">Base</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    IV
                    <Tooltip title="Individual Values (0-31)">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    EV
                    <Tooltip title="Effort Values (0-252, max 510 total)">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell align="center">Nature</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Final
                    <Tooltip title="Calculated stat at the specified level">
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statData.map((stat) => (
                <TableRow key={stat.name}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {stat.displayName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{stat.baseStat}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Slider
                      value={stat.iv}
                      onChange={(_, value) => handleIvChange(stat.name, value as number)}
                      min={0}
                      max={31}
                      valueLabelDisplay="auto"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Slider
                      value={stat.ev}
                      onChange={(_, value) => handleEvChange(stat.name, value as number)}
                      min={0}
                      max={252}
                      step={4}
                      valueLabelDisplay="auto"
                      size="small"
                      disabled={totalEvs >= 510 && stat.ev === 0}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {getNatureIcon(stat.name)}
                      <Typography 
                        variant="body2" 
                        color={getNatureColor(stat.name) === 'default' ? 'text.primary' : `${getNatureColor(stat.name)}.main`}
                      >
                        {(stat.natureMultiplier * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={stat.finalStat}
                      color={getNatureColor(stat.name)}
                      variant="filled"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Calculation Formula:</strong><br />
              • HP: ((2 × Base + IV + EV÷4) × Level ÷ 100) + Level + 10<br />
              • Other Stats: ((2 × Base + IV + EV÷4) × Level ÷ 100 + 5) × Nature Modifier<br />
              • EVs are divided by 4 (every 4 EVs = 1 stat point at level 100)<br />
              • Nature modifiers: +10% for favored stat, -10% for reduced stat
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatCalculator;