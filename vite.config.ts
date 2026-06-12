import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const reactNativeVectorIconsPlugin = () => ({
  name: 'react-native-vector-icons-plugin',
  enforce: 'pre' as const,
  async transform(code: string, id: string) {
    if (id.includes('react-native-vector-icons') && id.endsWith('.js')) {
      return await transformWithEsbuild(code, id, {
        loader: 'jsx',
        jsx: 'automatic'
      });
    }
  }
});

export default defineConfig({
  plugins: [react(), reactNativeVectorIconsPlugin()],
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-orientation-locker': path.resolve(__dirname, 'web/mocks/react-native-orientation-locker.js'),
      'react-native-sound': path.resolve(__dirname, 'web/mocks/react-native-sound.js'),
      '@components': path.resolve(__dirname, './src/components'),
      '@screens': path.resolve(__dirname, './src/screens'),
      '@services': path.resolve(__dirname, './src/services'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@app-types': path.resolve(__dirname, './src/types')
    },
    extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
      loader: {
        '.js': 'jsx'
      }
    },
    include: ['react-native-vector-icons']
  }
});
