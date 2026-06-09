// Derives a centerline "pen path" from the FINAL porcelain raster so the two
// share one coordinate space. Used as an animated stroke-mask: the stroke draws
// along the floral and reveals the filled art under the pen tip (a real drawing
// motion, fills intact). Output: public/porcelain-skeleton.svg (single <path>).
import sharp from 'sharp'
import { writeFileSync } from 'fs'

const IN = 'public/porcelain-art.png'
const OUT = 'public/porcelain-skeleton.svg'
const SKW = 700           // width to skeletonize at (speed); coords scaled back up
const ALPHA_FG = 90       // alpha >= this => inked pixel
const MIN_LEN = 7         // drop polylines shorter than this (downscaled px)
const DP_EPS = 1.1        // Douglas-Peucker tolerance (downscaled px)

const meta = await sharp(IN).metadata()
const FULLW = meta.width, FULLH = meta.height
const H = Math.round((SKW / FULLW) * FULLH)
const scale = FULLW / SKW

// --- binarize alpha at downscaled size ---
const { data } = await sharp(IN)
  .resize(SKW, H, { fit: 'fill' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const W = SKW
let bin = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) bin[i] = data[i * 4 + 3] >= ALPHA_FG ? 1 : 0

// --- Zhang-Suen thinning ---
const idx = (r, c) => r * W + c
function neighbors(b, r, c) {
  // p2..p9 clockwise from North
  return [
    b[idx(r - 1, c)], b[idx(r - 1, c + 1)], b[idx(r, c + 1)], b[idx(r + 1, c + 1)],
    b[idx(r + 1, c)], b[idx(r + 1, c - 1)], b[idx(r, c - 1)], b[idx(r - 1, c - 1)],
  ]
}
function transitions(p) {
  let n = 0
  for (let i = 0; i < 8; i++) if (p[i] === 0 && p[(i + 1) % 8] === 1) n++
  return n
}
function thin() {
  let changed = true
  while (changed) {
    changed = false
    for (const step of [0, 1]) {
      const del = []
      for (let r = 1; r < H - 1; r++) {
        for (let c = 1; c < W - 1; c++) {
          if (!bin[idx(r, c)]) continue
          const p = neighbors(bin, r, c)
          const B = p.reduce((a, v) => a + v, 0)
          if (B < 2 || B > 6) continue
          if (transitions(p) !== 1) continue
          const [p2, p3, p4, p5, p6, p7, p8, p9] = p
          if (step === 0) {
            if (p2 * p4 * p6 !== 0) continue
            if (p4 * p6 * p8 !== 0) continue
          } else {
            if (p2 * p4 * p8 !== 0) continue
            if (p2 * p6 * p8 !== 0) continue
          }
          del.push(idx(r, c))
        }
      }
      if (del.length) { changed = true; for (const i of del) bin[i] = 0 }
    }
  }
}
thin()

// --- trace polylines by walking the 1px skeleton ---
const used = new Uint8Array(W * H)
const nbrOffsets = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]]
function degree(r, c) {
  let d = 0
  for (const [dr, dc] of nbrOffsets) { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < H && cc < W && bin[idx(rr, cc)]) d++ }
  return d
}
function walkFrom(r0, c0) {
  const pts = [[c0, r0]]
  used[idx(r0, c0)] = 1
  let r = r0, c = c0
  while (true) {
    let next = null
    for (const [dr, dc] of nbrOffsets) {
      const rr = r + dr, cc = c + dc
      if (rr < 0 || cc < 0 || rr >= H || cc >= W) continue
      if (bin[idx(rr, cc)] && !used[idx(rr, cc)]) { next = [rr, cc]; break }
    }
    if (!next) break
    r = next[0]; c = next[1]
    used[idx(r, c)] = 1
    pts.push([c, r])
  }
  return pts
}
const polylines = []
// endpoints first (degree 1), then anything left (loops)
for (const wantDeg of [1, 99]) {
  for (let r = 1; r < H - 1; r++) {
    for (let c = 1; c < W - 1; c++) {
      if (!bin[idx(r, c)] || used[idx(r, c)]) continue
      if (wantDeg === 1 && degree(r, c) !== 1) continue
      const pl = walkFrom(r, c)
      if (pl.length >= MIN_LEN) polylines.push(pl)
    }
  }
}

// --- Douglas-Peucker simplify ---
function dp(pts, eps) {
  if (pts.length < 3) return pts
  let dmax = 0, idxm = 0
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i]
    const d = Math.abs((px - ax) * dy - (py - ay) * dx) / L
    if (d > dmax) { dmax = d; idxm = i }
  }
  if (dmax > eps) {
    const left = dp(pts.slice(0, idxm + 1), eps)
    const right = dp(pts.slice(idxm), eps)
    return left.slice(0, -1).concat(right)
  }
  return [pts[0], pts[pts.length - 1]]
}

// --- Catmull-Rom -> cubic bezier, emit scaled path ---
function emit(pts) {
  const P = pts.map(([x, y]) => [x * scale, y * scale])
  if (P.length < 2) return ''
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`
  if (P.length === 2) return d + `L${P[1][0].toFixed(1)} ${P[1][1].toFixed(1)}`
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

// Break each stroke into short chunks, then order ALL chunks left-to-right.
// This makes the draw sweep coherently across the floral (no long stem
// flooding the whole width first) while each chunk still paints along a real
// stroke, so it reads as drawing rather than a flat wipe.
const CHUNK = 55 // max chunk length in downscaled px
function chunk(pts) {
  const out = []
  let cur = [pts[0]]
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    cur.push(pts[i])
    if (acc >= CHUNK) { out.push(cur); cur = [pts[i]]; acc = 0 } // 1-pt overlap
  }
  if (cur.length >= 2) out.push(cur)
  else if (out.length) out[out.length - 1].push(...cur.slice(1))
  return out
}

const chunks = []
for (const pl of polylines) {
  const simp = dp(pl, DP_EPS)
  if (simp[0][0] > simp[simp.length - 1][0]) simp.reverse() // left-to-right
  for (const ch of chunk(simp)) chunks.push(ch)
}
chunks.sort((a, b) => {
  const ax = a.reduce((s, p) => s + p[0], 0) / a.length
  const bx = b.reduce((s, p) => s + p[0], 0) / b.length
  return ax - bx
})

let dAll = ''
let totalPts = 0
for (const ch of chunks) { totalPts += ch.length; dAll += emit(ch) }

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FULLW} ${FULLH}"><path d="${dAll}"/></svg>`
writeFileSync(OUT, svg)
console.log(`wrote ${OUT}: ${polylines.length} polylines, ${totalPts} pts, ${(svg.length / 1024).toFixed(0)}KB, viewBox ${FULLW}x${FULLH}`)
