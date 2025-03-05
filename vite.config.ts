
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Disable Tailwind Oxide's native binary
  optimizeDeps: {
    exclude: ['@tailwindcss/oxide'],
  },
  // Set environment variable to disable the native binary
  define: {
    'process.env.OXIDE_DISABLE_NATIVE': JSON.stringify('true'),
  },
}));
