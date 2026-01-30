/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    siberia_prod: D1Database;
  }
}

interface Env {
  siberia_prod: D1Database;
}
