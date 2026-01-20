// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    integrations: [svelte()],
    // Use empty base for relative asset paths
    base: '',
    build: {
        assets: '_assets',
        // Inline CSS to avoid path issues
        inlineStylesheets: 'always'
    },
    vite: {
        plugins: [tailwindcss()],
        build: {
            // Generate relative paths
            assetsDir: '_assets'
        }
    }
});
