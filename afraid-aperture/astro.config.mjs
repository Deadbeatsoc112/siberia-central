import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    runtime: {
      mode: 'local',
      type: 'pages',
      bindings: {
        UPLOADS_BUCKET: {
          type: 'r2',
        },
        DB: {
          type: 'd1',
        }
      }
    }
  })
});