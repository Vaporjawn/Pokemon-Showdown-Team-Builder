# Contributing to Pokémon Hub

First off, thank you for considering contributing to Pokémon Hub! It's people like you that make this project a great tool for the Pokémon community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that the issue has already been reported. When you are creating a bug report, please include as many details as possible:

#### Bug Report Template

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS, Windows, macOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- Device [e.g. iPhone 12, Desktop]

**Additional context**
Add any other context about the problem here.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the enhancement
- **Describe the current behavior** and explain what you would like to see instead
- **Explain why this enhancement would be useful**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you've added code that should be tested
4. **Ensure the test suite passes** with `npm test`
5. **Run E2E tests** with `npm run e2e`
6. **Make sure your code lints** with `npm run lint`
7. **Format your code** with `npm run format`
8. **Update documentation** if necessary
9. **Create a pull request**

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup Steps
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make your changes
5. Test your changes: `npm test`
6. Submit a pull request

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new files
- Follow the ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let` when possible
- Use arrow functions for inline functions

### React
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the established component structure
- Use Material-UI components when possible

### CSS/Styling
- Use Material-UI's theming system
- Follow the established design patterns
- Ensure responsive design
- Test on different screen sizes

### Testing
- Write unit tests for utilities and hooks
- Write component tests for React components
- Write E2E tests for user workflows
- Aim for good test coverage
- Use descriptive test names

### Git Commit Messages
Follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
- `feat(team-builder): add IV calculator component`
- `fix(pokedex): resolve infinite scroll loading issue`
- `docs(readme): update installation instructions`

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components
│   └── pages/          # Page-specific components
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test utilities and setup
```

## Component Guidelines

### Creating New Components

1. **Use functional components** with TypeScript
2. **Define clear prop interfaces** at the top of the file
3. **Use meaningful names** that describe the component's purpose
4. **Keep components focused** - one responsibility per component
5. **Add proper JSDoc comments** for complex components

```tsx
import React from 'react';

/**
 * Props for the PokemonCard component
 */
interface PokemonCardProps {
  /** The Pokemon data to display */
  pokemon: Pokemon;
  /** Whether the card is selected */
  selected?: boolean;
  /** Callback when the card is clicked */
  onClick?: (pokemon: Pokemon) => void;
}

/**
 * A card component for displaying Pokemon information
 */
export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  selected = false,
  onClick,
}) => {
  // Component implementation
};
```

### Testing Components

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonCard } from './PokemonCard';
import { mockPokemon } from '../test/test-utils';

describe('PokemonCard', () => {
  test('renders pokemon name', () => {
    render(<PokemonCard pokemon={mockPokemon} />);
    expect(screen.getByText(mockPokemon.name)).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<PokemonCard pokemon={mockPokemon} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockPokemon);
  });
});
```

## State Management

We use Zustand for state management. When creating new stores:

1. **Keep stores focused** on specific domains
2. **Use TypeScript** for type safety
3. **Include actions** in the store interface
4. **Add devtools support** in development

```tsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ExampleState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    { name: 'example-store' }
  )
);
```

## Performance Guidelines

1. **Use React.memo** for expensive components
2. **Implement lazy loading** for large components
3. **Optimize bundle size** with code splitting
4. **Cache API responses** appropriately
5. **Use proper keys** in lists
6. **Avoid creating objects in render**

## Accessibility Guidelines

1. **Use semantic HTML** elements
2. **Provide proper ARIA labels** and descriptions
3. **Ensure keyboard navigation** works correctly
4. **Test with screen readers**
5. **Maintain proper color contrast**
6. **Use focus indicators**

## Documentation

### JSDoc Comments
Use JSDoc for all public APIs:

```tsx
/**
 * Calculates the actual stat value for a Pokemon
 * @param baseStat - The base stat value
 * @param level - The Pokemon's level
 * @param iv - The individual value (0-31)
 * @param ev - The effort value (0-252)
 * @param nature - The nature modifier (0.9, 1.0, or 1.1)
 * @returns The calculated stat value
 */
export function calculateStat(
  baseStat: number,
  level: number,
  iv: number,
  ev: number,
  nature: number = 1.0
): number {
  // Implementation
}
```

### README Updates
Update the README when adding:
- New features
- Breaking changes
- New dependencies
- Setup instructions

## Release Process

1. **Update version** in package.json
2. **Update CHANGELOG.md** with changes
3. **Create a release tag**
4. **Deploy to production**

## Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: Join our community server for real-time chat

## Recognition

Contributors who make significant contributions will be recognized in:
- README acknowledgments
- Release notes
- Contributors list

Thank you for contributing to Pokémon Hub! 🎉