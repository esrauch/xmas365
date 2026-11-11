import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * `virtual:build-info`: the git commit (and whether there were uncommitted
 * changes) the page's code came from, shown in Settings to rule out a stale
 * tab. On the dev server it's re-read on every full page load.
 */
function buildInfo(): Plugin {
  const id = 'virtual:build-info';
  const resolved = `\0${id}`;
  const git = (args: string): string => {
    try {
      return execSync(`git ${args}`, {
        cwd: import.meta.dirname,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    } catch {
      return '';
    }
  };
  return {
    name: 'build-info',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return undefined;
      const info = {
        commit: git('rev-parse --short HEAD') || 'unknown',
        dirty: git('status --porcelain').length > 0,
        builtAt: new Date().toISOString(),
      };
      return `export default ${JSON.stringify(info)};`;
    },
    configureServer(server) {
      // A page load (its HTML) re-reads git, so the stamp is never older than the page.
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '').split('?')[0] ?? '';
        if (path === '/' || path.endsWith('.html')) {
          const mod = server.moduleGraph.getModuleById(resolved);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [buildInfo()],
  // Relative base so the build works from any subpath (e.g. GitHub Pages /xmas365/).
  base: './',
  build: {
    target: 'es2022',
    // three.js alone is ~520 kB minified (~130 kB gzipped), which is expected.
    chunkSizeWarningLimit: 800,
    // While we're building foundations, the deployed site includes the dev
    // tools (/dev/*) so they can be tested on real phones from a URL.
    // `npm run build:release` leaves them out.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ...(process.env.RELEASE === '1'
          ? {}
          : {
              devIndex: resolve(import.meta.dirname, 'dev/index.html'),
              devModels: resolve(import.meta.dirname, 'dev/models.html'),
              devPuzzles: resolve(import.meta.dirname, 'dev/puzzles.html'),
              devAudio: resolve(import.meta.dirname, 'dev/audio.html'),
            }),
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
});
