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
        siberia_uploads: {
          type: 'r2',
        },
        siberia_prod: {
          type: 'd1',
        }
      }
    }
  })
});