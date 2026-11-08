// Generates the web-ready images from the originals in assets-src/ (which are not deployed).
// Re-run after adding or replacing an original:  npm run images
//
//   assets-src/img/projects/<name>.png  ->  src/assets/img/projects/<name>-{480,960,1600,2560}.webp
//   assets-src/img/profile_picture.jpg  ->  src/assets/img/profile-256.webp  (home hero)
//                                          src/assets/img/profile-640.jpg   (CV Generator photo, JPEG for html2canvas)
//
// The widths must match SCREENSHOT_WIDTHS in src/app/data/responsive-image.ts.
import { mkdir, readdir, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SCREENSHOT_WIDTHS = [480, 960, 1600, 2560];
const SOURCE_PROJECTS = 'assets-src/img/projects';
const OUTPUT_PROJECTS = 'src/assets/img/projects';
const SOURCE_PROFILE = 'assets-src/img/profile_picture.jpg';
const OUTPUT_IMG = 'src/assets/img';

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

async function writeVariant(pipeline, outputPath) {
  await pipeline.toFile(outputPath);
  return (await stat(outputPath)).size;
}

async function projects() {
  await mkdir(OUTPUT_PROJECTS, { recursive: true });
  const files = (await readdir(SOURCE_PROJECTS)).filter((file) => /\.(png|jpe?g)$/i.test(file));

  for (const file of files) {
    const input = join(SOURCE_PROJECTS, file);
    const name = basename(file, extname(file));
    const sizes = [];
    for (const width of SCREENSHOT_WIDTHS) {
      // withoutEnlargement: originals narrower than a width keep their size but still get that file name.
      const pipeline = sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 });
      sizes.push(`${width}: ${kb(await writeVariant(pipeline, join(OUTPUT_PROJECTS, `${name}-${width}.webp`)))}`);
    }
    console.log(`${file} (${kb((await stat(input)).size)}) -> ${sizes.join(', ')}`);
  }
}

async function profile() {
  const hero = sharp(SOURCE_PROFILE).resize(256, 256, { fit: 'cover', position: 'attention' }).webp({ quality: 84 });
  const cv = sharp(SOURCE_PROFILE).resize(640, 640, { fit: 'cover', position: 'attention' }).jpeg({ quality: 86, mozjpeg: true });
  console.log(`profile-256.webp: ${kb(await writeVariant(hero, join(OUTPUT_IMG, 'profile-256.webp')))}`);
  console.log(`profile-640.jpg: ${kb(await writeVariant(cv, join(OUTPUT_IMG, 'profile-640.jpg')))}`);
}

await projects();
await profile();
