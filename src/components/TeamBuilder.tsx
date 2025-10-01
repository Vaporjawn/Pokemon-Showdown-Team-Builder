import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Card,
  CardContent,
  Fade,
  Alert,
  Divider,
} from '@mui/material';
import { 
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTeamStore, pokemonHelpers } from '../stores/teamStore';
import PokemonSlot from './PokemonSlot';
import PokemonEditor from './PokemonEditor';
import TeamControls from './TeamControls';
import { TeamActions } from './TeamActions';
import TeamAnalysis from './TeamAnalysis';

const TeamBuilder: React.FC = () => {
  const {
    currentTeam,
    selectedSlot,
    unsavedChanges,
    error,
    selectSlot,
    validateTeam,
    updatePokemon,
  } = useTeamStore();

  const validationErrors = validateTeam();
  const teamPokemonCount = currentTeam.pokemon.filter(p => pokemonHelpers.isValidPokemon(p)).length;

  const handleAddPokemon = (slotIndex: number, pokemonName: string) => {
    // Select the slot first
    selectSlot(slotIndex);

    // Add the Pokemon to that slot
    updatePokemon(slotIndex, {
      species: pokemonName,
      level: 50, // Set a default competitive level
    });
  };

  const getCurrentTeamPokemon = () => {
    return currentTeam.pokemon
      .filter((p): p is NonNullable<typeof p> => p !== null && pokemonHelpers.isValidPokemon(p))
      .map(p => p.species)
      .filter((species): species is string => Boolean(species));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  background: 'linear-gradient(135deg, #3B82F6, #F59E0B)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                {currentTeam.name}
              </Typography>
              {unsavedChanges && (
                <Chip 
                  label="Unsaved Changes" 
                  color="warning" 
                  size="small"
                  icon={<WarningIcon />}
                  sx={{ 
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              )}
              {teamPokemonCount === 6 && (
                <Chip 
                  label="Team Complete" 
                  color="success" 
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              )}
            </Box>

            <TeamActions />
          </Box>

          <Divider sx={{ mb: 2 }} />
          <TeamControls />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Fade in timeout={500}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            icon={<WarningIcon />}
          >
            <Typography variant="body1">{error}</Typography>
          </Alert>
        </Fade>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Fade in timeout={500}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            icon={<InfoIcon />}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Team Validation Issues:
            </Typography>
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                • {error}
              </Typography>
            ))}
          </Alert>
        </Fade>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Team Overview - Left Side */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '0 0 420px' } }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  Team Overview
                </Typography>
                <Chip 
                  label={`${teamPokemonCount}/6`}
                  color={teamPokemonCount === 6 ? 'success' : teamPokemonCount === 0 ? 'default' : 'primary'}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {currentTeam.pokemon.map((pokemon, index) => (
                  <PokemonSlot
                    key={index}
                    pokemon={pokemon}
                    slotIndex={index}
                    isSelected={selectedSlot === index}
                    onClick={() => selectSlot(index)}
                    onAddPokemon={handleAddPokemon}
                    currentTeamPokemon={getCurrentTeamPokemon()}
                  />
                ))}
              </Box>

              {/* Team Stats Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', borderRadius: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1.5, 
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  Team Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Pokémon Count:
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {teamPokemonCount}/6
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Generation:
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {currentTeam.generation}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Format:
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {currentTeam.format}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Team Analysis */}
          <Box>
            <TeamAnalysis />
          </Box>
        </Box>

        {/* Pokemon Editor - Right Side */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PokemonEditor />
        </Box>
      </Box>
    </Box>
  );
};

export default TeamBuilder;
