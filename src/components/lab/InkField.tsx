'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Domain-warped fbm noise → flowing black "ink" veins through porcelain.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for(int i = 0; i < 6; i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    uv.x *= u_res.x / u_res.y;
    float t = u_time * 0.06;

    // pull the flow gently toward the cursor
    vec2 m = u_mouse; m.x *= u_res.x / u_res.y;
    uv += (m - uv) * 0.06 * sin(u_time * 0.2);

    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(uv + 3.0*q + vec2(1.7, 9.2) + 0.15*t),
                  fbm(uv + 3.0*q + vec2(8.3, 2.8) - 0.12*t));
    float f = fbm(uv + 3.0*r);

    // ridged veins for a cracked-glaze feel
    float vein = 1.0 - abs(2.0 * f - 1.0);
    vein = pow(vein, 2.2);

    vec3 porcelain = vec3(0.965, 0.965, 0.975);
    vec3 ink       = vec3(0.03, 0.03, 0.045);
    float ink_mix  = smoothstep(0.45, 0.95, f) * 0.85 + vein * 0.25;

    vec3 col = mix(porcelain, ink, clamp(ink_mix, 0.0, 1.0));
    // faint cool porcelain tint in the highlights
    col += vec3(-0.01, 0.0, 0.02) * (1.0 - ink_mix);

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function InkField() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    }
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(quad)

    function resize() {
      const w = el!.clientWidth
      const h = el!.clientHeight
      renderer.setSize(w, h)
      uniforms.u_res.value.set(w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      uniforms.u_mouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      )
    }
    el.addEventListener('pointermove', onMove)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let raf = 0
    function loop() {
      uniforms.u_time.value = (performance.now() - start) / 1000
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    if (reduceMotion) {
      renderer.render(scene, camera)
    } else {
      loop()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      el.removeEventListener('pointermove', onMove)
      quad.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={ref} className="absolute inset-0" />
}
