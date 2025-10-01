import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const bundleAnalyzer = (): PluginOption => ({
  name: 'bundle-analyzer',
  generateBundle(options, bundle) {
    if (process.env.ANALYZE) {
      const stats = Object.entries(bundle).map(([name, info]) => ({
        name,
        size: 'code' in info ? info.code.length : 0,
      }));
      console.log('Bundle Analysis:', stats.sort((a, b) => b.size - a.size));
    }
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bundleAnalyzer()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-utils': ['lodash', 'axios', 'zustand'],
          // Feature chunks
          'pokemon-data': [
            './src/services/dataService.ts',
            './src/services/pokemonDataService.ts',
            './src/data/fallback-pokemon-data.json',
          ],
          'team-management': [
            './src/stores/teamStore.ts',
            './src/utils/teamAnalysis.ts',
            './src/utils/showdownFormat.ts',
          ],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.ts', '').replace('.tsx', '')
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info.pop();
          const name = info.join('.') || 'asset';
          return `assets/${name}-[hash].${ext}`;
        },
      },
    },
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
    },
    // Chunk size warning threshold
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'lodash',
      'axios',
      'zustand',
    ],
  },
})
