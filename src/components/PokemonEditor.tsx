import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Autocomplete,
  Divider,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Delete as DeleteIcon, 
  OpenInNew as OpenInNewIcon, 
  Edit as EditIcon,
  Calculate as CalculateIcon,
  Image as ImageIcon,
  Star as StarIcon,
  EmojiNature as NatureIcon,
  Shield as AbilityIcon
} from '@mui/icons-material';
import { useTeamStore, pokemonHelpers } from '../stores/teamStore';
import { pokemonDataService } from '../services/dataService';
import PokemonSearchDialog from './PokemonSearchDialog';
import MoveEditorDialog from './MoveEditorDialog';
import AbilityEditor from './AbilityEditor';
import ItemEditor from './ItemEditor';
import NatureEditor from './NatureEditor';
import StatCalculator from './StatCalculator';
import { SpriteViewer } from './SpriteViewer';
import type { TeamPokemon } from '../types/team';
import type { Pokemon } from '../types/pokemon';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ padding: '16px 0' }}>
      {value === index && children}
    </div>
  );
};

const PokemonEditor: React.FC = () => {
  const { currentTeam, selectedSlot, updatePokemon, removePokemon } = useTeamStore();
  const [activeTab, setActiveTab] = useState(0);
  const [showPokemonSearch, setShowPokemonSearch] = useState(false);
  const [showMoveEditor, setShowMoveEditor] = useState(false);
  const [editingMoveIndex, setEditingMoveIndex] = useState<number>(0);
  
  // Enhancement dialog states
  const [showAbilityEditor, setShowAbilityEditor] = useState(false);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showNatureEditor, setShowNatureEditor] = useState(false);
  const [showStatCalculator, setShowStatCalculator] = useState(false);
  const [showSpriteViewer, setShowSpriteViewer] = useState(false);
  const [pokemonData, setPokemonData] = useState<Pokemon | null>(null);

  const currentPokemon = currentTeam.pokemon[selectedSlot];
  const isValid = pokemonHelpers.isValidPokemon(currentPokemon);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePokemonChange = (field: keyof TeamPokemon, value: unknown) => {
    updatePokemon(selectedSlot, { [field]: value });
  };

  const handleStatChange = (statName: string, value: number, statType: 'evs' | 'ivs') => {
    if (!currentPokemon) return;

    const newStats = {
      ...currentPokemon[statType],
      [statName]: Math.max(0, Math.min(statType === 'evs' ? 252 : 31, value)),
    };

    handlePokemonChange(statType, newStats);
  };

  const handleRemovePokemon = () => {
    removePokemon(selectedSlot);
  };

  const handleSelectPokemonFromSearch = (pokemonName: string, pokemonData?: Pokemon) => {
    handlePokemonChange('species', pokemonName);
    setShowPokemonSearch(false);

    // If we have Pokemon data, we could auto-populate other fields
    if (pokemonData && currentPokemon) {
      // Auto-set level if not set
      if (currentPokemon.level === 1) {
        handlePokemonChange('level', 50); // Common competitive level
      }
    }
  };

  const getCurrentTeamPokemon = () => {
    return currentTeam.pokemon
      .filter((p): p is NonNullable<typeof p> => p !== null && pokemonHelpers.isValidPokemon(p))
      .map(p => p.species)
      .filter((species): species is string => Boolean(species));
  };

  const handleOpenMoveEditor = (moveIndex: number) => {
    setEditingMoveIndex(moveIndex);
    setShowMoveEditor(true);
  };

  const handleMoveSelect = (moveName: string) => {
    if (!currentPokemon) return;
    
    const newMoves = [...currentPokemon.moves];
    newMoves[editingMoveIndex] = moveName;
    handlePokemonChange('moves', newMoves);
    setShowMoveEditor(false);
  };

  // Enhancement editor handlers
  const handleAbilitySelect = (ability: string) => {
    handlePokemonChange('ability', ability);
    setShowAbilityEditor(false);
  };

  const handleItemSelect = (item: string) => {
    handlePokemonChange('item', item);
    setShowItemEditor(false);
  };

  const handleNatureSelect = (nature: string) => {
    handlePokemonChange('nature', nature);
    setShowNatureEditor(false);
  };

  // Fetch Pokemon data when species changes
  useEffect(() => {
    const fetchPokemonData = async () => {
      if (currentPokemon?.species) {
        try {
          const data = await pokemonDataService.getPokemon(currentPokemon.species);
          setPokemonData(data);
        } catch (error) {
          console.error('Failed to fetch Pokemon data:', error);
          setPokemonData(null);
        }
      } else {
        setPokemonData(null);
      }
    };

    fetchPokemonData();
  }, [currentPokemon?.species]);

  // State for autocomplete options from DataService
  const [pokemonOptions, setPokemonOptions] = useState<string[]>([]);
  const [moveOptions, setMoveOptions] = useState<string[]>([]);
  const [itemOptions, setItemOptions] = useState<string[]>([]);
  const [abilityOptions, setAbilityOptions] = useState<string[]>([]);
  const [natureOptions, setNatureOptions] = useState<string[]>([]);

  // Load initial data on component mount
  useEffect(() => {
    // Load initial options
    setPokemonOptions(pokemonDataService.searchPokemon(''));
    setMoveOptions(pokemonDataService.searchMoves(''));
    setItemOptions(pokemonDataService.searchItems(''));
    setAbilityOptions(pokemonDataService.searchAbilities(''));
    setNatureOptions(pokemonDataService.getAllNatures());
  }, []);

  // Search handlers for autocomplete
  const handlePokemonSearch = (query: string) => {
    setPokemonOptions(pokemonDataService.searchPokemon(query));
  };

  const handleMoveSearch = (query: string) => {
    setMoveOptions(pokemonDataService.searchMoves(query));
  };

  const handleItemSearch = (query: string) => {
    setItemOptions(pokemonDataService.searchItems(query));
  };

  const handleAbilitySearch = (query: string) => {
    setAbilityOptions(pokemonDataService.searchAbilities(query));
  };

  const statNames = [
    { key: 'hp', label: 'HP' },
    { key: 'attack', label: 'Attack' },
    { key: 'defense', label: 'Defense' },
    { key: 'special-attack', label: 'Sp. Atk' },
    { key: 'special-defense', label: 'Sp. Def' },
    { key: 'speed', label: 'Speed' },
  ];

  if (!currentPokemon) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a team slot to edit a Pokémon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose from the team overview on the left to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ minHeight: 600 }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isValid ? pokemonHelpers.getDisplayName(currentPokemon) : `Slot ${selectedSlot + 1}`}
          </Typography>

          {isValid && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemovePokemon}
            >
              Remove
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mt: 1 }}>
          <Tab label="Basic" />
          <Tab label="Stats" />
          <Tab label="Moves" />
          <Tab label="Advanced" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 2 }}>
        {/* Basic Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Row 1 - Pokemon Species and Nickname */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={pokemonOptions}
                    value={currentPokemon.species || null}
                    onChange={(_, value) => handlePokemonChange('species', value)}
                    onInputChange={(_, newValue) => handlePokemonSearch(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pokémon Species"
                        placeholder="Search for a Pokémon..."
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    )}
                  />
                  <IconButton
                    onClick={() => setShowPokemonSearch(true)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Nickname"
                  value={currentPokemon.nickname || ''}
                  onChange={(e) => handlePokemonChange('nickname', e.target.value)}
                  placeholder="Optional nickname"
                />
              </Box>
            </Box>

            {/* Row 2 - Level and Shiny */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Level"
                  value={currentPokemon.level}
                  onChange={(e) => handlePokemonChange('level', Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentPokemon.shiny}
                      onChange={(e) => handlePokemonChange('shiny', e.target.checked)}
                    />
                  }
                  label="Shiny"
                />
              </Box>
            </Box>

            {/* Row 3 - Item and Ability */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={itemOptions}
                  value={currentPokemon.item || null}
                  onChange={(_, value) => handlePokemonChange('item', value)}
                  onInputChange={(_, newValue) => handleItemSearch(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Held Item" />
                  )}
                />
                <IconButton
                  onClick={() => setShowItemEditor(true)}
                  color="primary"
                  title="Open Item Browser"
                >
                  <StarIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={abilityOptions}
                  value={currentPokemon.ability || null}
                  onChange={(_, value) => handlePokemonChange('ability', value)}
                  onInputChange={(_, newValue) => handleAbilitySearch(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Ability" />
                  )}
                />
                <IconButton
                  onClick={() => setShowAbilityEditor(true)}
                  color="primary"
                  title="Open Ability Browser"
                >
                  <AbilityIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Row 4 - Nature and Happiness */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Nature</InputLabel>
                  <Select
                    value={currentPokemon.nature || ''}
                    label="Nature"
                    onChange={(e) => handlePokemonChange('nature', e.target.value)}
                  >
                    {natureOptions.map((nature) => (
                      <MenuItem key={nature} value={nature}>
                        {nature}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setShowNatureEditor(true)}
                  color="primary"
                  title="Open Nature Browser"
                >
                  <NatureIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Happiness"
                  value={currentPokemon.happiness}
                  onChange={(e) => handlePokemonChange('happiness', Number(e.target.value))}
                  inputProps={{ min: 0, max: 255 }}
                />
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Stats Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Stats & Training
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CalculateIcon />}
              onClick={() => setShowStatCalculator(true)}
              sx={{ minWidth: 200 }}
            >
              Advanced Calculator
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* EVs Column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                EVs (Effort Values)
              </Typography>

              {statNames.map(({ key, label }) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    value={currentPokemon.evs[key as keyof typeof currentPokemon.evs]}
                    onChange={(e) => handleStatChange(key, Number(e.target.value), 'evs')}
                    inputProps={{ min: 0, max: 252, step: 4 }}
                    size="small"
                  />
                </Box>
              ))}

              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2">
                  Total EVs: {pokemonHelpers.getStatTotal(currentPokemon)}/510
                </Typography>
              </Box>
            </Box>

            {/* IVs Column */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                IVs (Individual Values)
              </Typography>

              {statNames.map(({ key, label }) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    value={currentPokemon.ivs[key as keyof typeof currentPokemon.ivs]}
                    onChange={(e) => handleStatChange(key, Number(e.target.value), 'ivs')}
                    inputProps={{ min: 0, max: 31 }}
                    size="small"
                  />
                </Box>
              ))}

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  const perfectIvs = {
                    hp: 31,
                    attack: 31,
                    defense: 31,
                    'special-attack': 31,
                    'special-defense': 31,
                    speed: 31,
                  };
                  handlePokemonChange('ivs', perfectIvs);
                }}
                sx={{ mt: 2 }}
              >
                Set All to 31
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Moves Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Move Set
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentPokemon.moves.map((move, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Autocomplete
                    options={moveOptions}
                    value={move}
                    onChange={(_, value) => {
                      const newMoves = [...currentPokemon.moves];
                      newMoves[index] = value;
                      handlePokemonChange('moves', newMoves);
                    }}
                    onInputChange={(_, newValue) => handleMoveSearch(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Move ${index + 1}`}
                        placeholder="Select a move..."
                      />
                    )}
                  />
                </Box>
                <IconButton
                  onClick={() => handleOpenMoveEditor(index)}
                  size="large"
                  sx={{ mt: 1 }}
                  title="Open Advanced Move Editor"
                >
                  <EditIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button
            variant="outlined"
            onClick={() => {
              handlePokemonChange('moves', [null, null, null, null]);
            }}
          >
            Clear All Moves
          </Button>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Advanced Features
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Sprite Viewer Section */}
            {currentPokemon.species && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h3">
                      Pokemon Sprites
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and download all available sprites for {currentPokemon.species}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ImageIcon />}
                    onClick={() => setShowSpriteViewer(true)}
                    disabled={!pokemonData}
                  >
                    View All Sprites
                  </Button>
                </Box>
                
                {pokemonData?.sprites?.front_default && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      component="img"
                      src={pokemonData.sprites.front_default}
                      alt={`${currentPokemon.species} sprite`}
                      sx={{ width: 96, height: 96, imageRendering: 'pixelated' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Current sprite preview • Click "View All Sprites" to explore different forms and generations
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Enhanced Editors Section */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Enhanced Editors
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Access detailed information and advanced selection tools
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AbilityIcon />}
                  onClick={() => setShowAbilityEditor(true)}
                  sx={{ justifyContent: 'flex-start', p: 2, height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Ability Browser
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Detailed ability information and effects
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={() => setShowItemEditor(true)}
                  sx={{ justifyContent: 'flex-start', p: 2, height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Item Browser
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Comprehensive item database with descriptions
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<NatureIcon />}
                  onClick={() => setShowNatureEditor(true)}
                  sx={{ justifyContent: 'flex-start', p: 2, height: 'auto', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Nature Guide
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nature effects and stat modifications
                  </Typography>
                </Button>
              </Box>
            </Paper>

            {/* Pokemon Information Section */}
            {pokemonData && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Pokemon Information
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Base Stats Total
                    </Typography>
                    <Typography variant="h6">
                      {pokemonData.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Types
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {pokemonData.types?.map((type) => (
                        <Typography
                          key={type.type.name}
                          variant="body2"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'white',
                            textTransform: 'capitalize'
                          }}
                        >
                          {type.type.name}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Height / Weight
                    </Typography>
                    <Typography variant="body1">
                      {pokemonData.height ? `${(pokemonData.height / 10).toFixed(1)}m` : 'N/A'} / {pokemonData.weight ? `${(pokemonData.weight / 10).toFixed(1)}kg` : 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      Pokedex ID
                    </Typography>
                    <Typography variant="body1">
                      #{pokemonData.id?.toString().padStart(3, '0') || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </TabPanel>
      </Box>

      {/* Pokemon Search Dialog */}
      <PokemonSearchDialog
        open={showPokemonSearch}
        onClose={() => setShowPokemonSearch(false)}
        onSelectPokemon={handleSelectPokemonFromSearch}
        currentTeamPokemon={getCurrentTeamPokemon()}
      />

      {/* Move Editor Dialog */}
      <MoveEditorDialog
        open={showMoveEditor}
        onClose={() => setShowMoveEditor(false)}
        onSelectMove={handleMoveSelect}
        pokemonName={currentPokemon?.species || ''}
        currentMove={currentPokemon?.moves[editingMoveIndex] || ''}
      />

      {/* Enhancement Component Dialogs */}
      <AbilityEditor
        open={showAbilityEditor}
        onClose={() => setShowAbilityEditor(false)}
        onSelectAbility={handleAbilitySelect}
        pokemonName={currentPokemon.species}
        currentAbility={currentPokemon.ability}
      />

      <ItemEditor
        open={showItemEditor}
        onClose={() => setShowItemEditor(false)}
        onSelectItem={handleItemSelect}
        currentItem={currentPokemon.item}
      />

      <NatureEditor
        open={showNatureEditor}
        onClose={() => setShowNatureEditor(false)}
        onSelectNature={handleNatureSelect}
        currentNature={currentPokemon.nature}
      />

      <StatCalculator
        open={showStatCalculator}
        onClose={() => setShowStatCalculator(false)}
        pokemon={pokemonData}
      />

      <SpriteViewer
        open={showSpriteViewer}
        onClose={() => setShowSpriteViewer(false)}
        pokemon={pokemonData}
      />
    </Paper>
  );
};

export default PokemonEditor;
