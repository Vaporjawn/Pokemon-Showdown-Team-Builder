import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, test, expect } from 'vitest';
import App from '../App';

// Create a test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6',
    },
  },
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

describe('App Component', () => {
  test('renders the main application', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByText('Pokémon Hub')).toBeInTheDocument();
    expect(screen.getByText('Team Builder & Pokédex')).toBeInTheDocument();
  });

  test('displays navigation tabs', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByRole('tab', { name: /team builder/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pokédex/i })).toBeInTheDocument();
  });

  test('has accessible app structure', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Check for main landmarks
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
    expect(screen.getByRole('tablist')).toBeInTheDocument(); // Navigation tabs
  });
});