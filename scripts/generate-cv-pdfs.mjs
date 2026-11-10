// Prints the CV Generator page to text PDFs (selectable text, readable by ATS) with headless Chrome/Edge.
// Uses the data in src/app/components/demos/cv-generator/data/cv-david.{es,en}.json and the visual format.
//
//   1. npm start                      (the dev server must be running)
//   2. npm run cv-pdfs -- es en       (languages to render; default: es)
//
// Output: src/assets/cv/David-Diaz-Martinez-CV-{ES,EN}.pdf. Set CV_BASE_URL to use another server.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const baseUrl = process.env.CV_BASE_URL ?? 'http://localhost:4200';
const languages = process.argv.slice(2).length ? process.argv.slice(2) : ['es'];

const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
  .filter(Boolean)
  .find((path) => existsSync(path));
if (!browser) {
  console.error('Chrome/Edge not found. Set CHROME_PATH to its executable.');
  process.exit(1);
}

for (const language of languages) {
  if (!['es', 'en'].includes(language)) {
    console.error(`Unknown language "${language}" (use es or en).`);
    process.exit(1);
  }
  const output = resolve(`src/assets/cv/David-Diaz-Martinez-CV-${language.toUpperCase()}.pdf`);
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${output}`,
    `${baseUrl}/demos/cv-generator?lang=${language}`,
  ]);
  console.log(`${language}: ${output}`);
}
