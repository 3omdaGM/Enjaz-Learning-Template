import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => ({
  define: { __DEMO_TOOLS_ENABLED__: JSON.stringify(command === 'serve' || mode === 'demo' || mode === 'e2e') },
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}));
