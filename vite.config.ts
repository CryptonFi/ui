import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
    root,
    plugins: [react(), nodePolyfills()],
    build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // main: resolve(root, 'index.html'),
                admin: resolve(root, 'pages', 'admin', 'index.html'),
                orders: resolve(root, 'pages', 'orders', 'index.html'),
            },
        },
    },
    base: '/ui/',
});
