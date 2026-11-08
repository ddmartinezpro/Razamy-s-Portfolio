// Renders scripts/og-image.html into public/og-image.jpg (1200x630), the preview image used by
// LinkedIn, WhatsApp, X, etc. Needs Chrome or Edge (set CHROME_PATH if it is not found).
// Re-run with:  npm run og-image
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const browser = candidates.find((path) => existsSync(path));
if (!browser) {
  console.error('Chrome/Edge not found. Set CHROME_PATH to its executable.');
  process.exit(1);
}

const screenshot = resolve('public/og-image.tmp.png');
const output = resolve('public/og-image.jpg');
execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=8000',
  `--screenshot=${screenshot}`,
  pathToFileURL(resolve('scripts/og-image.html')).href,
]);
await sharp(screenshot).jpeg({ quality: 88, mozjpeg: true }).toFile(output);
rmSync(screenshot);
console.log(`og-image written to ${output}`);
