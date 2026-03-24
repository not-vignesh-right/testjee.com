import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: {
                name: 'TESTJEE Admin Dashboard',
                short_name: 'TESTJEE Admin',
                description: 'TESTJEE Admin Dashboard for Student Management',
                theme_color: '#ffffff',
                start_url: '/admin-secure-panel-7x9q',
                scope: '/',
                display: 'standalone',
                icons: [
                    {
                        src: 'logo.png',
                        sizes: 'any',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        port: 3001,
        open: true
    },
    build: {
        assetsInlineLimit: 0,
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    }
})
