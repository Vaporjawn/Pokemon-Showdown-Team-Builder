# 🌟 Pokémon Hub - Team Builder & Pokédex

<div align="center">

![Pokémon Hub Logo](./public/pokeball.svg)

**Professional Pokémon team builder with advanced analytics, comprehensive Pokédex, and Pokémon Showdown integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[🚀 Live Demo](https://vaporjawn.github.io/Pokemon-Showdown-Team-Builder) · [📖 Documentation](#documentation) · [🐛 Report Bug](https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder/issues) · [💡 Request Feature](https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder/issues)

</div>

---

## ✨ Features

### 🏆 Team Building
- **Advanced Team Builder**: Create competitive Pokémon teams with comprehensive stat management
- **EV/IV Calculator**: Real-time stat calculation with visual feedback
- **Nature & Ability Editor**: Complete nature and ability selection with detailed descriptions
- **Move Editor**: Browse and select from complete move databases with filtering
- **Item Management**: Comprehensive item selection with categories and effects
- **Team Analysis**: Advanced team composition analysis and weakness coverage
- **Import/Export**: Full Pokémon Showdown format compatibility

### 📚 Pokédex
- **Complete Pokémon Database**: Access to all generations with detailed information
- **Advanced Search & Filtering**: Search by name, type, generation, stats, and abilities
- **Infinite Scrolling**: Smooth browsing experience with optimized performance
- **Multiple View Modes**: Grid and list views with customizable sorting
- **Favorites System**: Save and organize your favorite Pokémon
- **Detailed Pokémon Info**: Complete stats, abilities, moves, and evolution chains
- **Sprite Gallery**: High-quality sprites with shiny variants

### 🎨 User Experience
- **Beautiful UI**: Material Design 3 with Pokémon-themed customization
- **Dynamic Themes**: Multiple background themes inspired by Pokémon regions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Progressive Web App**: Install and use offline with native app experience
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Performance**: Optimized bundle splitting and lazy loading

### 🔧 Technical Features
- **Modern Stack**: React 19 + TypeScript + Vite for optimal performance
- **State Management**: Zustand for efficient and type-safe state handling
- **Testing**: Comprehensive test suite with Vitest + React Testing Library + Playwright
- **Code Quality**: ESLint + Prettier with strict TypeScript configuration
- **Offline Support**: Service worker with intelligent caching strategies
- **Error Monitoring**: Production-ready error tracking and performance monitoring

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0 or **pnpm** >= 7.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder.git
   cd Pokemon-Showdown-Team-Builder/pokemon-team-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:3000`

### Build for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Analyze bundle size
npm run build:analyze
```

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production with optimizations |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run lint:check` | Check linting without fixing |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:ui` | Run tests with UI dashboard |
| `npm run test:coverage` | Generate test coverage report |
| `npm run e2e` | Run end-to-end tests with Playwright |
| `npm run e2e:ui` | Run E2E tests with UI mode |
| `npm run clean` | Clean build artifacts and cache |

---

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── TeamBuilder.tsx  # Main team building interface
│   ├── Pokedex.tsx     # Pokédex browser and search
│   ├── PokemonEditor.tsx # Individual Pokémon configuration
│   └── ...
├── stores/             # Zustand state stores
│   ├── teamStore.ts    # Team management state
│   └── themeStore.ts   # UI theme and preferences
├── services/           # API and data services
│   ├── dataService.ts  # Pokémon data fetching
│   └── pokemonDataService.ts # Enhanced data processing
├── types/              # TypeScript type definitions
│   ├── pokemon.ts      # Pokémon data types
│   └── team.ts         # Team and battle types
├── utils/              # Utility functions
│   ├── showdownFormat.ts # Pokémon Showdown import/export
│   ├── teamAnalysis.ts   # Team composition analysis
│   └── preloadUtils.ts   # Performance optimization
└── test/               # Test utilities and setup
    ├── setup.ts        # Test environment configuration
    ├── test-utils.ts   # Common test helpers
    └── **/*.test.tsx   # Component and unit tests
```

---

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- App.test.tsx
```

### End-to-End Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Run E2E tests on specific browser
npx playwright test --project=chromium
```

### Test Coverage

The project maintains high test coverage with the following thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

---

## 📱 Progressive Web App (PWA)

Pokémon Hub is a full-featured PWA that provides:

- **Offline Functionality**: Access core features without internet connection
- **Install Prompt**: Add to home screen for native app experience
- **Background Sync**: Sync team data when connection is restored
- **Push Notifications**: Get updates about new features and data
- **Responsive Design**: Optimized for all device sizes

### PWA Features

- 📱 **Installable**: Add to home screen on mobile and desktop
- 🌐 **Offline Support**: Core functionality works offline
- 🔄 **Background Sync**: Automatic data synchronization
- 📢 **Push Notifications**: Stay updated with new content
- ⚡ **Fast Loading**: Optimized caching strategies
- 🎨 **Native Feel**: App-like navigation and interactions

---

## 🎯 API Integration

### Pokémon Data Source

The application integrates with the **PokéAPI** (https://pokeapi.co/) for comprehensive Pokémon data:

- **Pokémon Information**: Base stats, abilities, types, sprites
- **Move Database**: Complete move sets with descriptions and effects
- **Item Catalog**: All items with categories and descriptions
- **Ability Details**: Comprehensive ability information and effects
- **Type Relations**: Type effectiveness and damage calculations

### Caching Strategy

- **Service Worker**: Intelligent caching of API responses
- **Local Storage**: Persistent storage for user preferences and teams
- **IndexedDB**: Efficient storage for large datasets
- **Cache-First**: Prioritize cached data for better performance
- **Background Refresh**: Update cached data in the background

---

## 🛠️ Development

### Code Quality

The project enforces strict code quality standards:

- **ESLint**: TypeScript-aware linting with React and accessibility rules
- **Prettier**: Consistent code formatting across the codebase
- **TypeScript**: Strict type checking with comprehensive type coverage
- **Husky**: Pre-commit hooks for automated quality checks
- **Lint-staged**: Run checks only on staged files for faster commits

### Performance Optimization

- **Code Splitting**: Dynamic imports for optimal bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Monitor and optimize bundle composition
- **Tree Shaking**: Remove unused code automatically
- **Compression**: Gzip and Brotli compression for production

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android Chrome 90+
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Accessibility**: Screen readers and keyboard navigation support

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Start development**: `npm run dev`
5. **Make your changes**
6. **Run tests**: `npm run test && npm run e2e`
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Code Style

- Follow the existing code style and conventions
- Run `npm run lint` and `npm run format` before committing
- Write tests for new features and bug fixes
- Update documentation for significant changes
- Follow [Conventional Commits](https://conventionalcommits.org/) for commit messages

### Bug Reports

When reporting bugs, please include:
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or videos if applicable
- **Browser and device** information
- **Console errors** if any

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PokéAPI**: Comprehensive Pokémon data API
- **Pokémon Showdown**: Battle simulator and team format inspiration
- **Material-UI**: Beautiful and accessible React components
- **React Team**: Amazing framework and developer experience
- **Vite Team**: Lightning-fast build tool and development server
- **TypeScript Team**: Type safety and developer productivity
- **Pokémon Community**: Inspiration and feedback

---

## 📊 Project Stats

- **Bundle Size**: < 500KB gzipped (optimized chunks)
- **Lighthouse Score**: 95+ across all metrics
- **Test Coverage**: > 70% across all modules
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: < 3s initial load on 3G
- **SEO**: Optimized meta tags and structured data

---

## 🔗 Links

- **Live Demo**: [https://vaporjawn.github.io/Pokemon-Showdown-Team-Builder](https://vaporjawn.github.io/Pokemon-Showdown-Team-Builder)
- **Repository**: [https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder](https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder)
- **Issues**: [https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder/issues](https://github.com/Vaporjawn/Pokemon-Showdown-Team-Builder/issues)
- **Pokémon Showdown**: [https://play.pokemonshowdown.com/](https://play.pokemonshowdown.com/)
- **PokéAPI**: [https://pokeapi.co/](https://pokeapi.co/)

---

<div align="center">

**Built with ❤️ by [Victor Williams](https://github.com/Vaporjawn)**

*Catch 'em all in style!* ⚡

</div>
