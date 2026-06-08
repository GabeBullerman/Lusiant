// Lightweight blur placeholder for next/image (works for remote images that
// don't have a precomputed LQIP). Renders a soft neutral grey while loading.

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f4f4f4" offset="20%" />
      <stop stop-color="#ececec" offset="50%" />
      <stop stop-color="#f4f4f4" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

export const blurURL = (w = 700, h = 933) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`
