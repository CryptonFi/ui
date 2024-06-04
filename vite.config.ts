import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const root = resolve(__dirname, 'src');
const pubDir = resolve(__dirname, 'public');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
    root,
    plugins: [react(), nodePolyfills()],
    publicDir: pubDir,
    build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(root, 'index.html'),
                admin: resolve(root, 'admin', 'index.html'),
            },
        },
    },
    base: '/ui/',
});
