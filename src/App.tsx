import React, { useState, Suspense, lazy, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Fab,
  Tabs,
  Tab,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  CatchingPokemon as PokemonIcon,
  Groups as TeamIcon,
  MenuBook as PokedexIcon,
} from '@mui/icons-material';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeStore } from './stores/themeStore';
import { initializeA11y } from './utils/accessibility';
import { initializeSEO, seoManager, SEO_CONFIGS } from './utils/seo';
import { useSkipLinks } from './hooks/useAccessibility';
import { security } from './utils/security';

// Lazy load main components for better performance
const TeamBuilder = lazy(() => import('./components/TeamBuilder'));
const Pokedex = lazy(() => import('./components/Pokedex'));
const BackgroundSelector = lazy(() => import('./components/BackgroundSelector'));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`app-tabpanel-${index}`}
    aria-labelledby={`app-tab-${index}`}
  >
    {value === index && children}
  </div>
);

// Loading fallback for lazy components
const ComponentLoader: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <CircularProgress size={40} />
    </Box>
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="rectangular" height={150} />
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Skeleton variant="rectangular" height={100} sx={{ flex: 1 }} />
      <Skeleton variant="rectangular" height={100} sx={{ flex: 1 }} />
    </Box>
  </Box>
);

const PokemonThemedApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const {
    currentBackground,
    setShowBackgroundSelector
  } = useThemeStore();

  // Initialize accessibility, SEO, and security features
  useEffect(() => {
    initializeA11y();
    initializeSEO();
    security.initializeSecurity();
  }, []);

  // Update SEO based on current tab
  useEffect(() => {
    const tabConfigs = [SEO_CONFIGS.teamBuilder, SEO_CONFIGS.pokedex];
    const currentConfig = tabConfigs[currentTab] || SEO_CONFIGS.home;
    seoManager.setPageMeta(currentConfig);
  }, [currentTab]);

  // Setup skip links
  useSkipLinks([
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#team-builder', label: 'Skip to team builder' }
  ]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const pokemonTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3B82F6', // Pokemon Blue
        light: '#60A5FA',
        dark: '#1E40AF',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#F59E0B', // Pokemon Gold/Yellow
        light: '#FCD34D',
        dark: '#D97706',
        contrastText: '#ffffff',
      },
      background: {
        default: currentBackground.backgroundColor || '#f8fafc',
        paper: currentBackground.cardBackdrop || 'rgba(255, 255, 255, 0.95)',
      },
      text: {
        primary: currentBackground.textColor || '#1f2937',
        secondary: '#6b7280',
      },
      error: {
        main: '#EF4444',
      },
      warning: {
        main: '#F59E0B',
      },
      info: {
        main: '#3B82F6',
      },
      success: {
        main: '#10B981',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: currentBackground.backgroundGradient || currentBackground.backgroundColor || '#f8fafc',
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            background: currentBackground.cardBackdrop || 'rgba(255, 255, 255, 0.95)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              '&:hover fieldset': {
                borderColor: '#3B82F6',
              },
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <ThemeProvider theme={pokemonTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', position: 'relative' }}>
          {/* App Bar */}
          <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PokemonIcon
                  sx={{
                    fontSize: 32,
                    color: '#F59E0B',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #3B82F6, #F59E0B)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    Pokémon Hub
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 500,
                    }}
                  >
                    Team Builder & Pokédex
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {currentBackground.name}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={() => setShowBackgroundSelector(true)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <PaletteIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Container maxWidth="xl" sx={{ mt: 0, mb: 4, position: 'relative' }}>
            <main id="main-content">
              {/* Navigation Tabs */}
              <Box id="navigation" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  aria-label="Pokemon app navigation tabs"
                  variant="fullWidth"
                  sx={{
                  '& .MuiTab-root': {
                    minHeight: 72,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  icon={<TeamIcon sx={{ fontSize: 28, mb: 1 }} />}
                  label="Team Builder"
                  id="app-tab-0"
                  aria-controls="app-tabpanel-0"
                />
                <Tab
                  icon={<PokedexIcon sx={{ fontSize: 28, mb: 1 }} />}
                  label="Pokédex"
                  id="app-tab-1"
                  aria-controls="app-tabpanel-1"
                />
              </Tabs>
            </Box>

              {/* Tab Content */}
              <TabPanel value={currentTab} index={0}>
                <section id="team-builder" aria-labelledby="app-tab-0">
                  <Suspense fallback={<ComponentLoader />}>
                    <TeamBuilder />
                  </Suspense>
                </section>
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                <section id="pokedex" aria-labelledby="app-tab-1">
                  <Suspense fallback={<ComponentLoader />}>
                    <Pokedex />
                  </Suspense>
                </section>
              </TabPanel>
            </main>
          </Container>

          {/* Floating Background Selector */}
          <Fab
            color="primary"
            aria-label="change background"
            onClick={() => setShowBackgroundSelector(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 30px rgba(59, 130, 246, 0.3)',
            }}
          >
            <PaletteIcon />
          </Fab>

          {/* Background Selector Dialog */}
          <Suspense fallback={null}>
            <BackgroundSelector />
          </Suspense>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

function App() {
  return <PokemonThemedApp />;
}

export default App;
