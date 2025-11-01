import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/tramites/tramites.js',
                'resources/js/contabilidad/kanban.js',
            ],
            refresh: true,
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('sweetalert2')) return 'vendor_swal';
                        if (id.includes('alpinejs')) return 'vendor_alpine';
                        if (id.includes('vue')) return 'vendor_vue';
                        return 'vendor';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    // Provide Vue feature flags for better tree-shaking and enable runtime template compilation
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    resolve: {
        alias: {
            // Alias to the esm-bundler build which supports runtime compilation when needed
            'vue': 'vue/dist/vue.esm-bundler.js',
            '@': fileURLToPath(new URL('./resources/js', import.meta.url))
        }
    }
});
