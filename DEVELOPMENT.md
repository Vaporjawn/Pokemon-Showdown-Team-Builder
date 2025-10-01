# Development Environment Setup

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Set up development environment
npm run prepare

# Start development server
npm run dev
```

## 🔧 Development Tools

### Code Quality
- **ESLint**: Strict TypeScript linting with React and accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates
- **Lint-staged**: Run checks only on staged files

### Testing
- **Vitest**: Fast unit testing with coverage reports
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end browser testing
- **MSW**: Mock service worker for API testing

### Build & Performance
- **Vite**: Lightning-fast development and build tool
- **Bundle Analyzer**: Analyze and optimize bundle sizes
- **Lighthouse CI**: Performance auditing in CI/CD
- **Size Limit**: Bundle size budget enforcement

### Type Safety
- **TypeScript**: Strict mode with comprehensive type checking
- **Type Coverage**: Monitor type safety across the codebase

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run dev:host     # Start dev server accessible on network
npm run build        # Build for production
npm run preview      # Preview production build
npm run clean        # Clean build artifacts and cache
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run lint:check   # Check linting without fixing
npm run format       # Format code with Prettier
npm run format:check # Check formatting without fixing
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI dashboard
npm run test:coverage # Generate test coverage report
npm run e2e          # Run end-to-end tests
npm run e2e:ui       # Run E2E tests with UI mode
```

### Analysis
```bash
npm run build:analyze # Analyze bundle composition
npm run lighthouse   # Run Lighthouse audit
npm run size-check   # Check bundle size limits
```

## 📁 Project Structure

```
pokemon-team-builder/
├── .github/           # GitHub workflows and templates
│   └── workflows/     # CI/CD pipeline configuration
├── .husky/            # Git hooks configuration
├── public/            # Static assets and PWA files
├── src/               # Source code
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and utility services
│   ├── stores/        # Zustand state stores
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and helpers
│   └── test/          # Test utilities and setup
├── e2e/               # End-to-end test files
└── dist/              # Production build output
```

## 🔄 Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical production fixes

### Commit Convention
Follow [Conventional Commits](https://conventionalcommits.org/):

```
feat(scope): add new team builder feature
fix(pokedex): resolve infinite scroll issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(store): optimize team state management
perf(bundle): reduce initial bundle size
test(e2e): add comprehensive user flow tests
chore(deps): update dependencies
```

### Pre-commit Checks
Automatic checks run on every commit:
- ESLint validation
- Prettier formatting
- TypeScript compilation
- Unit test execution

## 🧪 Testing Strategy

### Unit Tests
- **Coverage Target**: 70% minimum
- **Tools**: Vitest + React Testing Library
- **Focus**: Component behavior, utility functions, hooks

### Integration Tests
- **Tools**: Vitest + MSW
- **Focus**: Component interactions, API integrations

### E2E Tests
- **Tools**: Playwright
- **Focus**: User workflows, cross-browser compatibility
- **Browsers**: Chrome, Firefox, Safari, Mobile

### Visual Regression Tests
- **Tools**: Playwright screenshots
- **Focus**: UI consistency across updates

## 🚀 CI/CD Pipeline

### Continuous Integration
1. **Code Quality**: Linting, formatting, type checking
2. **Testing**: Unit tests with coverage reporting
3. **Build**: Production build with optimization
4. **E2E Tests**: Cross-browser testing
5. **Security**: Dependency scanning and SAST
6. **Performance**: Lighthouse audits and bundle analysis

### Continuous Deployment
- **Trigger**: Push to `main` branch
- **Target**: GitHub Pages
- **Process**: Build → Test → Deploy → Audit

### Quality Gates
- ✅ All tests must pass
- ✅ Code coverage ≥ 70%
- ✅ Lighthouse score ≥ 90
- ✅ Bundle size within limits
- ✅ Security audit clean
- ✅ Type checking passes

## 🔍 Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Comprehensive type coverage
- Consistent type imports

### React
- Functional components with hooks
- Proper prop typing with interfaces
- Memoization for performance-critical components
- Accessibility compliance (WCAG 2.1 AA)

### Performance
- Bundle size limits enforced
- Code splitting for large components
- Lazy loading for non-critical features
- Optimized images and assets

### Security
- Regular dependency updates
- Security audit integration
- Content Security Policy
- Input validation and sanitization

## 📊 Monitoring & Analytics

### Development Metrics
- Build time tracking
- Test execution duration
- Bundle size trends
- Type coverage evolution

### Production Monitoring
- Error tracking and reporting
- Performance metrics (Core Web Vitals)
- User analytics (privacy-respecting)
- Feature usage statistics

## 🔧 Development Tips

### Performance Optimization
```bash
# Analyze bundle composition
npm run build:analyze

# Check performance budget
npm run lighthouse

# Monitor memory usage
npm run dev -- --inspect
```

### Debugging
```bash
# Debug tests
npm run test:ui

# Debug E2E tests
npm run e2e:ui

# Debug build issues
npm run build -- --debug
```

### IDE Setup
Recommended VS Code extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)
- GitLens

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### PR Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Type definitions included
- [ ] Accessibility verified
- [ ] Performance impact assessed
- [ ] Security implications reviewed

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean Vite cache
npm run clean
```

**Test Issues**
```bash
# Update test snapshots
npm run test -- --update-snapshots

# Debug failing tests
npm run test:ui
```

**E2E Test Issues**
```bash
# Update Playwright browsers
npx playwright install

# Debug in headed mode
npm run e2e -- --headed
```

### Performance Issues
- Check bundle analyzer for large dependencies
- Verify proper code splitting implementation
- Review component memoization usage
- Analyze network waterfall in DevTools

### Type Errors
- Ensure all dependencies have type definitions
- Check TypeScript configuration strictness
- Verify proper import/export patterns
- Use type assertions sparingly

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Material-UI Documentation](https://mui.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)