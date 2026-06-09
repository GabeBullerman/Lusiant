// Splits the porcelain art into two animation layers (same coordinate space as
// public/porcelain-art.png):
//   1. public/porcelain-trace.svg  - vector OUTLINE contours of the art (potrace).
//      Stroked + drawn on via stroke-dashoffset = the "tracing" animation. Traces
//      every shape's silhouette, so the heavily-filled left orchids are included.
//   2. public/porcelain-fills.png  - the SOLID filled/shaded regions only (thin
//      linework removed via morphological opening). Revealed after the trace so it
//      adds interior shading WITHOUT thickening the already-drawn outlines.
import sharp from 'sharp'
import potrace from 'potrace'
import { writeFileSync } from 'fs'

const ART = 'public/porcelain-art.png'
const OUT_FILLS = 'public/porcelain-fills.png'
const OUT_TRACE = 'public/porcelain-trace.svg'
const OPEN_R = 7 // opening radius (px @ full res): removes lines up to ~2r thick

// ---- load art alpha at full res ----
const { data: art, info } = await sharp(ART).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const FW = info.width, FH = info.height
const alpha = new Uint8Array(FW * FH)
for (let i = 0; i < FW * FH; i++) alpha[i] = art[i * 4 + 3]

// ---- separable grayscale morphology (min=erode, max=dilate) ----
function morph(src, w, h, r, kind) {
  const pick = kind === 'min' ? Math.min : Math.max
  const tmp = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = src[y * w + x]
    for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < w) v = pick(v, src[y * w + xx]) }
    tmp[y * w + x] = v
  }
  const out = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = tmp[y * w + x]
    for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < h) v = pick(v, tmp[yy * w + x]) }
    out[y * w + x] = v
  }
  return out
}

// opening = erode then dilate -> keeps solid blobs, drops thin lines
const fills = morph(morph(alpha, FW, FH, OPEN_R, 'min'), FW, FH, OPEN_R, 'max')
// Threshold to remove faint blocky speckle the grayscale morphology leaves,
// then a light blur re-introduces clean antialiased edges.
const fillRGBA = Buffer.alloc(FW * FH * 4)
for (let i = 0; i < FW * FH; i++) fillRGBA[i * 4 + 3] = fills[i] >= 128 ? 255 : 0
await sharp(fillRGBA, { raw: { width: FW, height: FH, channels: 4 } })
  .blur(1.2)
  .png({ compressionLevel: 9 })
  .toFile(OUT_FILLS)
console.log('wrote', OUT_FILLS, FW + 'x' + FH)

// ---- potrace contours of the full art ----
const artWhite = await sharp(ART).flatten({ background: '#ffffff' }).png().toBuffer()
const svg = await new Promise((res, rej) => {
  potrace.trace(artWhite, { threshold: 160, turdSize: 6, optCurve: true, alphaMax: 1, turnPolicy: 'minority' },
    (err, out) => (err ? rej(err) : res(out)))
})
const rawD = svg.match(/ d="([^"]+)"/)?.[1] ?? ''

// Flatten the bezier contours into polylines so we can break the few giant
// contours into small chunks and order them left-to-right -> the dash-draw
// sweeps smoothly across the art instead of revealing whole contours at once.
const cube = (a, b, c, d, t) => { const m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d }
function flatten(dStr) {
  const toks = dStr.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || []
  const polys = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0, i = 0, cmd = null
  const n = () => parseFloat(toks[i++])
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) { cmd = toks[i++] }
    if (cmd === 'M' || cmd === 'm') {
      if (cmd === 'm') { x += n(); y += n() } else { x = n(); y = n() }
      sx = x; sy = y; if (cur && cur.length > 1) polys.push(cur); cur = [[x, y]]; cmd = cmd === 'm' ? 'l' : 'L'
    } else if (cmd === 'L' || cmd === 'l') {
      if (cmd === 'l') { x += n(); y += n() } else { x = n(); y = n() }; cur.push([x, y])
    } else if (cmd === 'C' || cmd === 'c') {
      let x1, y1, x2, y2, nx, ny
      if (cmd === 'c') { x1 = x + n(); y1 = y + n(); x2 = x + n(); y2 = y + n(); nx = x + n(); ny = y + n() }
      else { x1 = n(); y1 = n(); x2 = n(); y2 = n(); nx = n(); ny = n() }
      for (let s = 1; s <= 6; s++) { const t = s / 6; cur.push([cube(x, x1, x2, nx, t), cube(y, y1, y2, ny, t)]) }
      x = nx; y = ny
    } else if (cmd === 'Z' || cmd === 'z') { cur.push([sx, sy]); x = sx; y = sy }
    else { i++ }
  }
  if (cur && cur.length > 1) polys.push(cur)
  return polys
}

// Douglas-Peucker simplify
function dp(pts, eps) {
  if (pts.length < 3) return pts
  let dmax = 0, im = 0
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
  for (let k = 1; k < pts.length - 1; k++) { const [px, py] = pts[k]; const dd = Math.abs((px - ax) * dy - (py - ay) * dx) / L; if (dd > dmax) { dmax = dd; im = k } }
  if (dmax > eps) return dp(pts.slice(0, im + 1), eps).slice(0, -1).concat(dp(pts.slice(im), eps))
  return [pts[0], pts[pts.length - 1]]
}

// chunk a polyline into pieces of max CHUNK length (full-res px)
const CHUNK = 170
function chunk(pts) {
  const out = []; let cur = [pts[0]]; let acc = 0
  for (let k = 1; k < pts.length; k++) {
    acc += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); cur.push(pts[k])
    if (acc >= CHUNK) { out.push(cur); cur = [pts[k]]; acc = 0 }
  }
  if (cur.length >= 2) out.push(cur); else if (out.length) out[out.length - 1].push(...cur.slice(1))
  return out
}

// Catmull-Rom -> cubic bezier
function emit(P) {
  if (P.length < 2) return ''
  let s = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`
  if (P.length === 2) return s + `L${P[1][0].toFixed(1)} ${P[1][1].toFixed(1)}`
  for (let k = 0; k < P.length - 1; k++) {
    const p0 = P[k - 1] || P[k], p1 = P[k], p2 = P[k + 1], p3 = P[k + 2] || P[k + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    s += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return s
}

// Chunk the (dense) flattened contours FIRST so closed loops become open
// pieces, THEN simplify each piece (DP collapses closed loops to 2 points
// because their start≈end chord is degenerate).
const MIN_CHUNK = 14 // drop micro-chunks (full-res px) that render as stray dots
const plen = pts => { let L = 0; for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L }
const chunks = []
for (const poly of flatten(rawD)) {
  for (const ch of chunk(poly)) {
    if (plen(ch) < MIN_CHUNK) continue
    const simp = dp(ch, 1.2)
    if (simp.length >= 2) chunks.push(simp)
  }
}
chunks.sort((a, b) => (a.reduce((s, p) => s + p[0], 0) / a.length) - (b.reduce((s, p) => s + p[0], 0) / b.length))
const d = chunks.map(emit).join('')

writeFileSync(OUT_TRACE, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}"><path d="${d}"/></svg>`)
console.log('wrote', OUT_TRACE, chunks.length, 'chunks,', (d.length / 1024).toFixed(0) + 'KB')
