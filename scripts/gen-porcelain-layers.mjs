// Builds the two porcelain animation layers (same coordinate space as
// public/porcelain-art.png):
//   1. public/porcelain-trace.svg - vector OUTLINE contours (potrace), broken
//      into short left-to-right chunks so the pen can trace them in order.
//   2. public/porcelain-fills.png - the EXACT original shading (spiky solid
//      regions, full detail) with only the thin outline strips removed (the ones
//      the trace redraws on top). Revealed after the trace, it adds the fills
//      without thickening the lines.
import sharp from 'sharp'
import potrace from 'potrace'
import { writeFileSync } from 'fs'

const ART = 'public/porcelain-art.png'
const OUT_FILLS = 'public/porcelain-fills.png'
const OUT_TRACE = 'public/porcelain-trace.svg'
const STROKE = 5      // outline width (viewBox px); MUST match the component's strokeWidth
const MASK_STROKE = 2.5 // strip removed from fills; kept NARROWER than STROKE so the
                        // trace always over-covers it (no white gap) while still
                        // hiding the line remnants (no thickening)
const CHUNK = 170     // max trace-chunk length (px) before reordering left-to-right
const MIN_CHUNK = 30  // drop micro-chunks that render as stray dots
const TURD = 24       // potrace: suppress speckles up to this area (drops tiny dots)

// ---- load art alpha at full res ----
const { data: art, info } = await sharp(ART).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const FW = info.width, FH = info.height
const alpha = new Uint8Array(FW * FH)
for (let i = 0; i < FW * FH; i++) alpha[i] = art[i * 4 + 3]

// ---- potrace contours of the full art ----
const artWhite = await sharp(ART).flatten({ background: '#ffffff' }).png().toBuffer()
const svg = await new Promise((res, rej) => {
  potrace.trace(artWhite, { threshold: 160, turdSize: TURD, optCurve: true, alphaMax: 1, turnPolicy: 'minority' },
    (err, out) => (err ? rej(err) : res(out)))
})
const rawD = svg.match(/ d="([^"]+)"/)?.[1] ?? ''

// ---- flatten bezier contours -> polylines ----
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
function dp(pts, eps) {
  if (pts.length < 3) return pts
  let dmax = 0, im = 0
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
  for (let k = 1; k < pts.length - 1; k++) { const [px, py] = pts[k]; const dd = Math.abs((px - ax) * dy - (py - ay) * dx) / L; if (dd > dmax) { dmax = dd; im = k } }
  if (dmax > eps) return dp(pts.slice(0, im + 1), eps).slice(0, -1).concat(dp(pts.slice(im), eps))
  return [pts[0], pts[pts.length - 1]]
}
const plen = pts => { let L = 0; for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L }
function chunk(pts) {
  const out = []; let cur = [pts[0]]; let acc = 0
  for (let k = 1; k < pts.length; k++) {
    acc += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); cur.push(pts[k])
    if (acc >= CHUNK) { out.push(cur); cur = [pts[k]]; acc = 0 }
  }
  if (cur.length >= 2) out.push(cur); else if (out.length) out[out.length - 1].push(...cur.slice(1))
  return out
}
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

// chunk first (so closed loops become open pieces), then simplify each piece
const chunks = []
for (const poly of flatten(rawD)) {
  for (const ch of chunk(poly)) {
    if (plen(ch) < MIN_CHUNK) continue
    const simp = dp(ch, 1.2)
    // Re-check on the simplified geometry and require real extent so degenerate
    // near-zero-length pieces don't render as round-cap dots.
    if (simp.length >= 2 && plen(simp) >= MIN_CHUNK) chunks.push(simp)
  }
}
chunks.sort((a, b) => (a.reduce((s, p) => s + p[0], 0) / a.length) - (b.reduce((s, p) => s + p[0], 0) / b.length))
const d = chunks.map(emit).join('')
writeFileSync(OUT_TRACE, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}"><path d="${d}"/></svg>`)
console.log('wrote', OUT_TRACE, chunks.length, 'chunks')

// ---- fills = original shading with the outline strips removed ----
// Rasterize the trace as a stroke mask, then keep the original art everywhere
// EXCEPT under that stroke (those line pixels are redrawn by the trace on top).
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}"><rect width="${FW}" height="${FH}" fill="black"/><path d="${d}" fill="none" stroke="white" stroke-width="${MASK_STROKE}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const { data: maskData } = await sharp(Buffer.from(maskSvg)).resize(FW, FH, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const fillRGBA = Buffer.alloc(FW * FH * 4)
for (let i = 0; i < FW * FH; i++) {
  // Only remove where the strip is essentially solid (high threshold) so the
  // antialiased edge isn't carved out, keeping fills flush under the trace.
  const onLine = maskData[i * 4] > 160
  fillRGBA[i * 4 + 3] = onLine ? 0 : alpha[i]
}
await sharp(fillRGBA, { raw: { width: FW, height: FH, channels: 4 } }).png({ compressionLevel: 9 }).toFile(OUT_FILLS)
console.log('wrote', OUT_FILLS, FW + 'x' + FH)
