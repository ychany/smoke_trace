import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'smoketrace',
  brand: {
    displayName: '흡연의 흔적',
    primaryColor: '#f97316',
    icon: 'https://smoketrace.vercel.app/smoke_trace.png',
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
