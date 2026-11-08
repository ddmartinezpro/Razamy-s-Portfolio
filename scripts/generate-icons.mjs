// Generates the favicon and PWA icons from the Razamy logo. Re-run with:  npm run icons
//
//   public/favicon.ico            16/32/48 px (PNG-in-ICO), requested by browsers at /favicon.ico
//   public/favicon.svg            vector favicon for modern browsers
//   public/icons/icon-{192,512}.png           purpose "any" (transparent background)
//   public/icons/icon-maskable-{192,512}.png  purpose "maskable" (logo inside the 80% safe zone)
//   public/icons/apple-touch-icon.png         180 px, opaque (iOS ignores transparency)
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const LOGO = 'src/assets/icons/razamy_logo_icon.svg';
const BACKGROUND = '#f6f9fb'; // --color-bg (light theme)

// The logo declares width in px and height in mm, which librsvg scales differently than browsers.
// Rasterize from a copy whose width/height follow the viewBox so the aspect ratio is preserved.
const logoSvg = await readFile(LOGO, 'utf8');
const [, , viewBoxWidth, viewBoxHeight] = logoSvg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const normalizedLogo = Buffer.from(
  logoSvg.replace(/\swidth="[^"]*"\s+height="[^"]*"/, ` width="${viewBoxWidth * 20}" height="${viewBoxHeight * 20}"`),
);

/** Logo rendered at `widthRatio` of a square `size` canvas, centered. */
async function icon(size, widthRatio, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
  const logo = await sharp(normalizedLogo)
    .trim()
    .resize({ width: Math.round(size * widthRatio) })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
}

/** Minimal ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map(({ data }) => data)]);
}

await mkdir('public/icons', { recursive: true });

for (const size of [192, 512]) {
  await writeFile(`public/icons/icon-${size}.png`, await icon(size, 0.9));
  // Maskable: a 1.85:1 logo at 62% width stays inside the circular 80% safe zone.
  await writeFile(`public/icons/icon-maskable-${size}.png`, await icon(size, 0.62, BACKGROUND));
}
await writeFile('public/icons/apple-touch-icon.png', await icon(180, 0.78, BACKGROUND));

const faviconSizes = [16, 32, 48];
const favicons = await Promise.all(faviconSizes.map(async (size) => ({ size, data: await icon(size, 1) })));
await writeFile('public/favicon.ico', ico(favicons));
await copyFile(LOGO, 'public/favicon.svg');

console.log('icons generated');
