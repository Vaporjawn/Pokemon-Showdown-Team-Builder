#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * Validates and sets up the optimal development environment
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  step: (msg) => console.log(chalk.cyan('→'), msg)
};

async function checkNodeVersion() {
  log.step('Checking Node.js version...');

  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    log.error(`Node.js ${nodeVersion} detected. Please upgrade to Node.js 18 or higher.`);
    process.exit(1);
  }

  log.success(`Node.js ${nodeVersion} ✓`);
}

function checkPackageManager() {
  log.step('Checking package manager...');

  try {
    execSync('npm --version', { stdio: 'ignore' });
    log.success('npm is available ✓');
  } catch {
    log.error('npm is not available. Please install Node.js with npm.');
    process.exit(1);
  }
}

function installDependencies() {
  log.step('Installing dependencies...');

  try {
    execSync('npm ci', { stdio: 'inherit' });
    log.success('Dependencies installed ✓');
  } catch (error) {
    log.warn('npm ci failed, falling back to npm install...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      log.success('Dependencies installed ✓');
    } catch {
      log.error('Failed to install dependencies');
      process.exit(1);
    }
  }
}

function setupGitHooks() {
  log.step('Setting up Git hooks...');

  try {
    execSync('npm run prepare', { stdio: 'inherit' });
    log.success('Git hooks configured ✓');
  } catch {
    log.warn('Git hooks setup failed (non-critical)');
  }
}

function verifyEnvironment() {
  log.step('Verifying development environment...');

  const checks = [
    { cmd: 'npm run type-check', name: 'TypeScript compilation' },
    { cmd: 'npm run lint:check', name: 'ESLint validation' },
    { cmd: 'npm run format:check', name: 'Prettier formatting' }
  ];

  let failures = 0;

  for (const check of checks) {
    try {
      execSync(check.cmd, { stdio: 'ignore' });
      log.success(`${check.name} ✓`);
    } catch {
      log.error(`${check.name} failed`);
      failures++;
    }
  }

  if (failures > 0) {
    log.warn(`${failures} checks failed. Run 'npm run lint' and 'npm run format' to fix issues.`);
  }
}

function createEnvironmentFile() {
  const envFile = '.env.local';

  if (!existsSync(envFile)) {
    log.step('Creating local environment file...');

    const envContent = `# Local Development Environment Variables
# Add your local overrides here

# Development server configuration
VITE_DEV_PORT=3000
VITE_DEV_HOST=localhost

# Feature flags
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# API configuration (if needed)
# VITE_API_BASE_URL=http://localhost:8000
# VITE_API_TIMEOUT=30000

# Analytics (development)
VITE_ANALYTICS_ENABLED=false
`;

    writeFileSync(envFile, envContent);
    log.success('Environment file created ✓');
  }
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Pokemon Team Builder - Development Setup\n'));

  try {
    await checkNodeVersion();
    checkPackageManager();
    installDependencies();
    setupGitHooks();
    createEnvironmentFile();
    verifyEnvironment();

    console.log(chalk.bold.green('\n✨ Development environment ready!\n'));

    log.info('Quick start commands:');
    console.log('  npm run dev          # Start development server');
    console.log('  npm run test         # Run tests');
    console.log('  npm run build        # Build for production');
    console.log('  npm run lint         # Fix linting issues');
    console.log('  npm run format       # Format code');

  } catch (error) {
    log.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main();