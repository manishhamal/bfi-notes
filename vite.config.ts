import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // PDF Viewer
                if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
                  return 'vendor-pdf';
                }
                // Rich Text Editor
                if (id.includes('@tiptap') || id.includes('prosemirror')) {
                  return 'vendor-editor';
                }
                // Auth & DB
                if (id.includes('@supabase')) {
                  return 'vendor-supabase';
                }
                // Animations & Markdown
                if (id.includes('motion') || id.includes('framer-motion')) {
                  return 'vendor-animation';
                }
                if (id.includes('marked') || id.includes('rehype') || id.includes('remark')) {
                  return 'vendor-markdown';
                }
                // UI Core
                if (id.includes('lucide-react')) {
                  return 'vendor-icons';
                }
                if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom')) {
                  return 'vendor-react';
                }
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
