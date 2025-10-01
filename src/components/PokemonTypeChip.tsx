import React from 'react';
import { Chip } from '@mui/material';

interface PokemonTypeChipProps {
  type: string;
  size?: 'small' | 'medium';
}

// Pokemon type colors for a better visual experience
const TYPE_COLORS: { [key: string]: { background: string; color: string } } = {
  normal: { background: '#A8A878', color: '#000' },
  fire: { background: '#F08030', color: '#fff' },
  water: { background: '#6890F0', color: '#fff' },
  electric: { background: '#F8D030', color: '#000' },
  grass: { background: '#78C850', color: '#000' },
  ice: { background: '#98D8D8', color: '#000' },
  fighting: { background: '#C03028', color: '#fff' },
  poison: { background: '#A040A0', color: '#fff' },
  ground: { background: '#E0C068', color: '#000' },
  flying: { background: '#A890F0', color: '#000' },
  psychic: { background: '#F85888', color: '#fff' },
  bug: { background: '#A8B820', color: '#000' },
  rock: { background: '#B8A038', color: '#fff' },
  ghost: { background: '#705898', color: '#fff' },
  dragon: { background: '#7038F8', color: '#fff' },
  dark: { background: '#705848', color: '#fff' },
  steel: { background: '#B8B8D0', color: '#000' },
  fairy: { background: '#EE99AC', color: '#000' },
};

const PokemonTypeChip: React.FC<PokemonTypeChipProps> = ({ type, size = 'small' }) => {
  const colors = TYPE_COLORS[type.toLowerCase()] || { background: '#68A090', color: '#fff' };

  return (
    <Chip
      label={type.toUpperCase()}
      size={size}
      sx={{
        bgcolor: colors.background,
        color: colors.color,
        fontWeight: 'bold',
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 20 : 24,
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        },
      }}
    />
  );
};

export default PokemonTypeChip;
