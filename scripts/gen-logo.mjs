// Generates brand assets from the LS-blossom-NT logo (.ai):
//   - src/app/favicon.ico, src/app/icon.png, src/app/apple-icon.png  (blossom mark)
//   - public/logo-wordmark.png  (solid wordmark silhouette, used as a CSS mask so
//     the navbar can tint it white over the hero / black on inner pages)
//
// Run: npm run logo
import * as mupdf from 'mupdf'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'fs'

const SRC = 'D:/Downloads/Lusiant Assets/For Gabe/ai files/lsnt logo mac.ai'
const BLOSSOM = { r: 141, g: 172, b: 218 } // periwinkle brand color for the mark
const Z = 5

// ---- render the .ai to a hi-res raster ----
const doc = mupdf.Document.openDocument(readFileSync(SRC), 'application/pdf')
const page = doc.loadPage(0)
const pix = page.toPixmap(mupdf.Matrix.scale(Z, Z), mupdf.ColorSpace.DeviceRGB, false, false)
const hiPng = Buffer.from(pix.asPNG())
const HW = pix.getWidth(), HH = pix.getHeight()

// background colour (artboard) sampled from a corner
const corner = await sharp(hiPng).extract({ left: 2, top: 2, width: 4, height: 4 }).raw().toBuffer()
const BG = [corner[0], corner[1], corner[2]]
const dist = (data, i) => Math.abs(data[i * 4] - BG[0]) + Math.abs(data[i * 4 + 1] - BG[1]) + Math.abs(data[i * 4 + 2] - BG[2])

// flood-fill the artboard from the borders; everything not reached is "solid"
function solidMask(data, W, H, bgTol) {
  const isBg = i => dist(data, i) < bgTol
  const outside = new Uint8Array(W * H)
  const stack = []
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x)
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1)
  while (stack.length) {
    const p = stack.pop()
    if (outside[p] || !isBg(p)) continue
    outside[p] = 1
    const x = p % W, y = (p - x) / W
    if (x > 0) stack.push(p - 1); if (x < W - 1) stack.push(p + 1)
    if (y > 0) stack.push(p - W); if (y < H - 1) stack.push(p + W)
  }
  const solid = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) solid[i] = outside[i] ? 0 : 1
  return solid
}

// ---- locate the wordmark bbox on the hi-res raster ----
const { data: hiData } = await sharp(hiPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
let mnx = HW, mny = HH, mxx = 0, mxy = 0
for (let y = 0; y < HH; y += 4) for (let x = 0; x < HW; x += 4) {
  if (dist(hiData, y * HW + x) > 70) { if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y }
}
const bboxH = mxy - mny
const CX = Math.round((mnx + mxx) / 2), CY = Math.round((mny + mxy) / 2)
const R = Math.round(bboxH * 0.52) // blossom sits at the wordmark centre, ~half its height

// ---- extract the blossom (petals + centre ring) ----
const { data: cData, info: cInfo } = await sharp(hiPng)
  .extract({ left: CX - R, top: CY - R, width: R * 2, height: R * 2 })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const CWi = cInfo.width, CHi = cInfo.height
const csolid = solidMask(cData, CWi, CHi, 78)
const lab = new Int32Array(CWi * CHi)
const keep = new Uint8Array(CWi * CHi)
const cxC = CWi / 2, cyC = CHi / 2
const FLOWER_R = R * 0.85, MIN_AREA = (R * R) * 0.027 // scale thresholds with size
let comp = 0
for (let s = 0; s < CWi * CHi; s++) {
  if (!csolid[s] || lab[s]) continue
  comp++; let area = 0, maxd = 0; const st = [s]; lab[s] = comp; const pts = []
  while (st.length) {
    const p = st.pop(); pts.push(p); area++
    const x = p % CWi, y = (p - x) / CWi
    const dd = Math.hypot(x - cxC, y - cyC); if (dd > maxd) maxd = dd
    if (x > 0 && csolid[p - 1] && !lab[p - 1]) { lab[p - 1] = comp; st.push(p - 1) }
    if (x < CWi - 1 && csolid[p + 1] && !lab[p + 1]) { lab[p + 1] = comp; st.push(p + 1) }
    if (y > 0 && csolid[p - CWi] && !lab[p - CWi]) { lab[p - CWi] = comp; st.push(p - CWi) }
    if (y < CHi - 1 && csolid[p + CWi] && !lab[p + CWi]) { lab[p + CWi] = comp; st.push(p + CWi) }
  }
  if (area > MIN_AREA && maxd < FLOWER_R) for (const p of pts) keep[p] = 1
}
const petalRGBA = Buffer.alloc(CWi * CHi * 4)
for (let i = 0; i < CWi * CHi; i++) if (keep[i]) { petalRGBA[i * 4] = BLOSSOM.r; petalRGBA[i * 4 + 1] = BLOSSOM.g; petalRGBA[i * 4 + 2] = BLOSSOM.b; petalRGBA[i * 4 + 3] = 255 }
const blossomTrimmed = await sharp(petalRGBA, { raw: { width: CWi, height: CHi, channels: 4 } }).trim().png().toBuffer()
const bm = await sharp(blossomTrimmed).metadata()
// centre on a padded square
const side = Math.round(Math.max(bm.width, bm.height) * 1.22)
const blossomSquare = await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: blossomTrimmed }]).png().toBuffer()

// ---- favicons ----
await sharp(blossomSquare).resize(512, 512).png().toFile('src/app/icon.png')
await sharp(blossomSquare).resize(180, 180).png().toFile('src/app/apple-icon.png')
const ico16 = await sharp(blossomSquare).resize(16, 16).png().toBuffer()
const ico32 = await sharp(blossomSquare).resize(32, 32).png().toBuffer()
const ico48 = await sharp(blossomSquare).resize(48, 48).png().toBuffer()
writeFileSync('src/app/favicon.ico', await pngToIco([ico16, ico32, ico48]))
console.log('wrote favicon.ico / icon.png / apple-icon.png  (blossom', side + 'px )')

// ---- wordmark silhouette (for the adaptive nav logo) ----
const WMW = 2400
const WMH = Math.round((WMW / HW) * HH)
const { data: wData } = await sharp(hiPng).resize(WMW, WMH, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const wsolid = solidMask(wData, WMW, WMH, 60)
const wRGBA = Buffer.alloc(WMW * WMH * 4)
for (let i = 0; i < WMW * WMH; i++) if (wsolid[i]) wRGBA[i * 4 + 3] = 255 // black + alpha
await sharp(wRGBA, { raw: { width: WMW, height: WMH, channels: 4 } })
  .trim().blur(0.5).png({ compressionLevel: 9 }).toFile('public/logo-wordmark.png')
const wm = await sharp('public/logo-wordmark.png').metadata()
console.log('wrote public/logo-wordmark.png', wm.width + 'x' + wm.height)
