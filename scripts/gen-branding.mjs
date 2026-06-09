/**
 * Generate all favicon / app-icon / OpenGraph assets from a single source.
 *
 * Drop these into ./assets-src/ (gitignored) then run:  npm run branding
 *   - icon-source.png   (REQUIRED) square, transparent, >=1024px — the mark used for favicons/app icons
 *   - logo.svg          (optional)  vector wordmark, copied to public/logo.svg for the navbar
 *   - logo.png          (optional)  transparent wordmark, used to compose the OG image
 *
 * Outputs (Next 16 App Router auto-wires these by filename):
 *   src/app/icon.png             (512)  -> <link rel="icon">
 *   src/app/apple-icon.png       (180)  -> <link rel="apple-touch-icon">
 *   src/app/favicon.ico          (16/32/48 multi-size)
 *   src/app/opengraph-image.png  (1200x630) -> og:image
 *   src/app/twitter-image.png    (1200x630) -> twitter:image
 *   public/logo.svg              (if logo.svg provided)
 */
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFile, writeFile, copyFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'assets-src')
const APP = path.join(root, 'src', 'app')
const PUB = path.join(root, 'public')

// Brand background for the OG card (off-white / porcelain)
const OG_BG = { r: 245, g: 244, b: 241, alpha: 1 }

const exists = async (p) => access(p).then(() => true).catch(() => false)

async function main() {
  const iconSrc = path.join(SRC, 'icon-source.png')
  if (!(await exists(iconSrc))) {
    console.error(`\n  Missing ${path.relative(root, iconSrc)}`)
    console.error('  Export a square, transparent PNG (>=1024px) of the mark there, then re-run.\n')
    process.exit(1)
  }

  const base = sharp(iconSrc).ensureAlpha()
  const meta = await base.metadata()
  console.log(`source: ${meta.width}x${meta.height}`)

  // --- App icons (transparent) ---
  await base.clone().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(APP, 'icon.png'))
  console.log('wrote src/app/icon.png (512)')

  // Apple touch icon: Apple ignores transparency -> flat white bg + padding
  await base.clone()
    .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 15, bottom: 15, left: 15, right: 15, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: '#ffffff' })
    .png().toFile(path.join(APP, 'apple-icon.png'))
  console.log('wrote src/app/apple-icon.png (180)')

  // --- favicon.ico (multi-size, white bg for legibility in tab) ---
  const icoSizes = [16, 32, 48]
  const icoBuffers = await Promise.all(
    icoSizes.map((s) =>
      base.clone()
        .resize(Math.round(s * 0.8), Math.round(s * 0.8), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: Math.ceil(s * 0.1), bottom: Math.floor(s * 0.1),
          left: Math.ceil(s * 0.1), right: Math.floor(s * 0.1),
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten({ background: '#ffffff' })
        .png().toBuffer()
    )
  )
  await writeFile(path.join(APP, 'favicon.ico'), await pngToIco(icoBuffers))
  console.log('wrote src/app/favicon.ico (16/32/48)')

  // --- OpenGraph / Twitter image (1200x630) ---
  const logoPng = path.join(SRC, 'logo.png')
  const ogLogoSrc = (await exists(logoPng)) ? logoPng : iconSrc
  const logoResized = await sharp(ogLogoSrc).ensureAlpha()
    .resize(620, 320, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer()

  const ogImg = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: OG_BG },
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .png().toBuffer()
  await sharp(ogImg).png().toFile(path.join(APP, 'opengraph-image.png'))
  await sharp(ogImg).png().toFile(path.join(APP, 'twitter-image.png'))
  console.log('wrote src/app/opengraph-image.png + twitter-image.png (1200x630)')

  // --- Vector wordmark for the navbar ---
  const logoSvg = path.join(SRC, 'logo.svg')
  if (await exists(logoSvg)) {
    await copyFile(logoSvg, path.join(PUB, 'logo.svg'))
    console.log('copied public/logo.svg')
  } else {
    console.log('(no logo.svg provided — navbar keeps the LS&NT text wordmark)')
  }

  console.log('\nBranding assets generated. Run `npx next build` then commit.\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
