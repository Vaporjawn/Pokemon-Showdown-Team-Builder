import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material';
import { CatchingPokemon as PokemonIcon, Add as AddIcon } from '@mui/icons-material';
import type { TeamPokemon } from '../types/team';
import { pokemonHelpers } from '../stores/teamStore';
import PokemonSearchDialog from './PokemonSearchDialog';
import type { Pokemon } from '../types/pokemon';

interface PokemonSlotProps {
  pokemon: TeamPokemon | null;
  slotIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onAddPokemon?: (slotIndex: number, pokemonName: string, pokemonData?: Pokemon) => void;
  currentTeamPokemon?: string[];
}

const PokemonSlot: React.FC<PokemonSlotProps> = ({
  pokemon,
  slotIndex,
  isSelected,
  onClick,
  onAddPokemon,
  currentTeamPokemon = [],
}) => {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const isValid = pokemonHelpers.isValidPokemon(pokemon);
  const displayName = pokemon ? pokemonHelpers.getDisplayName(pokemon) : `Slot ${slotIndex + 1}`;

  const handleSelectPokemon = (pokemonName: string, pokemonData?: Pokemon) => {
    if (onAddPokemon) {
      onAddPokemon(slotIndex, pokemonName, pokemonData);
    }
    setShowSearchDialog(false);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSearchDialog(true);
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.light',
          backgroundColor: 'action.hover',
        },
        minHeight: 80,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Pokemon Avatar/Icon */}
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: isValid ? 'primary.main' : 'grey.400',
            }}
          >
            {isValid ? (
              // Placeholder for Pokemon sprite - we'll add real sprites later
              <Typography variant="h6">
                {pokemon?.species?.charAt(0).toUpperCase() || '?'}
              </Typography>
            ) : (
              <PokemonIcon />
            )}
          </Avatar>

          {/* Pokemon Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: isValid ? 'bold' : 'normal',
                color: isValid ? 'text.primary' : 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </Typography>

            {isValid && pokemon && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Level {pokemon.level}
                  {pokemon.shiny && (
                    <Chip
                      label="✨"
                      size="small"
                      sx={{ ml: 1, height: 20, minWidth: 20, borderRadius: '50%' }}
                    />
                  )}
                </Typography>

                {/* Show first few moves */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {pokemon.moves.slice(0, 2).map((move, index) => (
                    move && (
                      <Chip
                        key={index}
                        label={move}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 18 }}
                      />
                    )
                  ))}
                  {pokemon.moves.filter(m => m !== null).length > 2 && (
                    <Chip
                      label={`+${pokemon.moves.filter(m => m !== null).length - 2}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 18 }}
                    />
                  )}
                </Box>
              </>
            )}

            {!isValid && (
              <Typography variant="body2" color="text.secondary">
                Click to add Pokémon
              </Typography>
            )}
          </Box>

          {/* Quick Add Button for empty slots */}
          {!isValid && onAddPokemon && (
            <Tooltip title="Quick Add Pokémon">
              <IconButton
                onClick={handleQuickAdd}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {/* Pokemon Search Dialog for quick add */}
      {showSearchDialog && (
        <PokemonSearchDialog
          open={showSearchDialog}
          onClose={() => setShowSearchDialog(false)}
          onSelectPokemon={handleSelectPokemon}
          currentTeamPokemon={currentTeamPokemon}
        />
      )}
    </Card>
  );
};

export default PokemonSlot;
