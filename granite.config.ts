import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'smoketrace',
  brand: {
    displayName: 'SMOKE TRACE',
    primaryColor: '#f97316',
    icon: './public/smoke_trace.png',
  },
  permissions: [],
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
    },
  },
});
