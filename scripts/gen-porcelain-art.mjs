// Renders the porcelain floral .ai to a faithful black-on-transparent PNG.
// Line darkness -> alpha, so filled petals & shading are preserved (unlike a
// centerline trace). Rotated so the floral runs horizontally to fill the band.
import * as mupdf from 'mupdf'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

const SRC = 'D:/Downloads/Lusiant Assets/For Gabe/ai files/shattered porcelain denim pattern.ai'
const OUT = 'public/porcelain-art.png'
const ZOOM = 2.5          // render scale (1080x1440 -> 2700x3600)
const ROTATE = -52        // deg; bring the NW->SE floral diagonal to horizontal
const THRESHOLD = 238     // luma at/above this -> fully transparent (white bg)
const K = 2.4             // contrast of darkness->alpha ramp
const MAXW = 2200

const buf = readFileSync(SRC)
const doc = mupdf.Document.openDocument(buf, 'application/pdf')
const page = doc.loadPage(0)
const pix = page.toPixmap(mupdf.Matrix.scale(ZOOM, ZOOM), mupdf.ColorSpace.DeviceRGB, false, false)
const W = pix.getWidth(), H = pix.getHeight()
const n = pix.getNumberOfComponents(), stride = pix.getStride()
const src = pix.getPixels()
console.log('rendered', W, 'x', H, 'comps', n, 'stride', stride)

// Build black RGBA where alpha = clamp((THRESHOLD - luma) * K)
const rgba = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const si = y * stride + x * n
    const r = src[si], g = src[si + 1], b = src[si + 2]
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    let a = (THRESHOLD - luma) * K
    a = a < 0 ? 0 : a > 255 ? 255 : a
    const di = (y * W + x) * 4
    rgba[di] = 0; rgba[di + 1] = 0; rgba[di + 2] = 0; rgba[di + 3] = a
  }
}

const out = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .rotate(ROTATE, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .trim()
  .resize({ width: MAXW, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: false })
  .toBuffer()
writeFileSync(OUT, out)
const meta = await sharp(out).metadata()
console.log('wrote', OUT, (out.length / 1024).toFixed(0) + 'KB', meta.width + 'x' + meta.height)
