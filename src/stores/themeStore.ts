import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Pokemon Showdown inspired backgrounds and themes
export interface PokemonBackground {
  id: string;
  name: string;
  description: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  backgroundColor?: string;
  textColor?: string;
  cardBackdrop?: string;
  category: 'generation' | 'legendary' | 'region' | 'special';
}

export const POKEMON_BACKGROUNDS: PokemonBackground[] = [
  // Generation Themes
  {
    id: 'kanto',
    name: 'Kanto Classic',
    description: 'The original adventure begins',
    backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'johto',
    name: 'Johto Gold',
    description: 'Golden memories of Johto',
    backgroundGradient: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'hoenn',
    name: 'Hoenn Sapphire',
    description: 'Land and sea adventure',
    backgroundGradient: 'linear-gradient(135deg, #3498db 0%, #27ae60 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'sinnoh',
    name: 'Sinnoh Diamond',
    description: 'Diamonds shine eternal',
    backgroundGradient: 'linear-gradient(135deg, #9b59b6 0%, #3498db 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'unova',
    name: 'Unova Black & White',
    description: 'Truth and ideals clash',
    backgroundGradient: 'linear-gradient(135deg, #34495e 0%, #ecf0f1 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.9)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'kalos',
    name: 'Kalos Beauty',
    description: 'Beauty and elegance',
    backgroundGradient: 'linear-gradient(135deg, #e74c3c 0%, #8e44ad 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'alola',
    name: 'Alola Sunset',
    description: 'Tropical paradise',
    backgroundGradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #e74c3c 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },
  {
    id: 'galar',
    name: 'Galar Dynamax',
    description: 'Power beyond limits',
    backgroundGradient: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'generation'
  },

  // Legendary Themes
  {
    id: 'legendary-fire',
    name: 'Legendary Fire',
    description: 'Blazing legendary power',
    backgroundGradient: 'linear-gradient(135deg, #ff4757 0%, #ff6348 50%, #ff7675 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.9)',
    textColor: '#2c3e50',
    category: 'legendary'
  },
  {
    id: 'legendary-water',
    name: 'Legendary Ocean',
    description: 'Depths of legendary power',
    backgroundGradient: 'linear-gradient(135deg, #0984e3 0%, #00b894 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'legendary'
  },
  {
    id: 'legendary-psychic',
    name: 'Psychic Dimension',
    description: 'Mind over matter',
    backgroundGradient: 'linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'legendary'
  },

  // Special Themes
  {
    id: 'competitive',
    name: 'Competitive Arena',
    description: 'For serious battles',
    backgroundGradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#ffffff',
    category: 'special'
  },
  {
    id: 'shiny',
    name: 'Shiny Sparkle',
    description: 'Rare and beautiful',
    backgroundGradient: 'linear-gradient(135deg, #ffd700 0%, #ffeb3b 50%, #fff59d 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.9)',
    textColor: '#2c3e50',
    category: 'special'
  },
  {
    id: 'night',
    name: 'Moonlit Night',
    description: 'Under the stars',
    backgroundGradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#ffffff',
    category: 'special'
  },
  {
    id: 'forest',
    name: 'Viridian Forest',
    description: 'Deep in the woods',
    backgroundGradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    cardBackdrop: 'rgba(255, 255, 255, 0.95)',
    textColor: '#2c3e50',
    category: 'special'
  }
];

interface ThemeState {
  currentBackground: PokemonBackground;
  isDarkMode: boolean;
  showBackgroundSelector: boolean;
  setBackground: (background: PokemonBackground) => void;
  toggleDarkMode: () => void;
  setShowBackgroundSelector: (show: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentBackground: POKEMON_BACKGROUNDS[0], // Default to Kanto
      isDarkMode: false,
      showBackgroundSelector: false,

      setBackground: (background) => set({ currentBackground: background }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setShowBackgroundSelector: (show) => set({ showBackgroundSelector: show }),
    }),
    {
      name: 'pokemon-theme-store',
    }
  )
);
