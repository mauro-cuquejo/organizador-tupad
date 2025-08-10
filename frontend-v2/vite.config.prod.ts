import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuración para producción
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Configuración específica para producción
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@headlessui/react', '@heroicons/react'],
            utils: ['axios', 'date-fns', 'clsx'],
          },
        },
      },
    },
    // Exponer variables de entorno al cliente
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '2.0.0'),
      __APP_ENV__: JSON.stringify('production'),
    },
    // Configuración del servidor de preview
    preview: {
      port: parseInt(env.VITE_DEV_SERVER_PORT || '3000'),
      host: false,
    },
  }
})
