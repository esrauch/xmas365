/**
 * Render the game's icons from their SVG sources (assets-src/svg/icon.svg and
 * favicon.svg) into public/icons/, which Vite serves as-is:
 *
 *   npm run make-icons
 *
 * Writes the launcher icon at 180 (Apple touch), 192 and 512 (web app manifest),
 * a 32 px favicon PNG, and copies the favicon SVG. Uses the system Chrome
 * through playwright-core, so the text renders with real fonts.
 */
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'assets-src', 'svg');
const OUT = join(ROOT, 'public', 'icons');
mkdirSync(OUT, { recursive: true });

const renders: { svg: string; size: number; file: string }[] = [
  { svg: 'icon.svg', size: 180, file: 'icon-180.png' },
  { svg: 'icon.svg', size: 192, file: 'icon-192.png' },
  { svg: 'icon.svg', size: 512, file: 'icon-512.png' },
  { svg: 'favicon.svg', size: 32, file: 'favicon-32.png' },
];

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  for (const { svg, size, file } of renders) {
    const data = readFileSync(join(SRC, svg), 'base64');
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">` +
        `<img src="data:image/svg+xml;base64,${data}" width="${size}" height="${size}" style="display:block">` +
        `</body></html>`,
    );
    await page.waitForFunction(() => document.images[0]?.complete === true);
    await page.screenshot({ path: join(OUT, file), omitBackground: true });
    console.log(`public/icons/${file}`);
  }
} finally {
  await browser.close();
}
copyFileSync(join(SRC, 'favicon.svg'), join(OUT, 'favicon.svg'));
console.log('public/icons/favicon.svg');
