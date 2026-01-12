// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR mode
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 3000,
    host: true
  },
  vite: {
    ssr: {
      noExternal: ['@awesome.me/webawesome']
    }
  },
  experimental: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        // Allow iframe embedding from any danger.direct subdomain
        'frame-ancestors https://*.danger.direct https://danger.direct'
      ]
    }
  }
});
