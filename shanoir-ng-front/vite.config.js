import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
    base: '/shanoir-ng/',
    root: './src',
    plugins: [angular({
        tsconfig: '../tsconfig.json'
    })],
    server: {
        host: '0.0.0.0',
        port: 4200,
        allowedHosts: ['shanoir-ng-nginx', 'localhost', 'front-dev'],
        hmr: {
            host: 'shanoir-ng-nginx',
            protocol: 'wss',
            clientPort: 443
        },
        cors: true
    }
});
