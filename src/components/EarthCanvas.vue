<template>
  <div ref="container" class="earth-canvas">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载地球仪...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import type { Attraction } from '@/types'
import { attractions } from '@/data/attractions'

const emit = defineEmits<{
  (e: 'select-attraction', attraction: Attraction): void
}>()

const container = ref<HTMLDivElement>()
const isLoading = ref(true)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let earthMesh: THREE.Mesh
let cloudsMesh: THREE.Mesh
let atmosphereMesh: THREE.Mesh
let gridGroup: THREE.Group
let markersGroup: THREE.Group
let labelsGroup: THREE.Group
let orbitRingsGroup: THREE.Group
let countryBordersGroup: THREE.Group
let earthGroup: THREE.Group
let animationId: number
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2
let previousMousePosition = { x: 0, y: 0 }
let isDragging = false
let targetDistance = 3.5
let currentDistance = 3.5
let autoRotateSpeed = 0.0003
let clock: THREE.Clock

const countryLabels = [
  { name: '中国', lat: 35, lng: 105 },
  { name: '俄罗斯', lat: 60, lng: 100 },
  { name: '加拿大', lat: 55, lng: -100 },
  { name: '美国', lat: 38, lng: -95 },
  { name: '巴西', lat: -10, lng: -55 },
  { name: '澳大利亚', lat: -25, lng: 135 },
  { name: '印度', lat: 20, lng: 77 },
  { name: '英国', lat: 54, lng: -2 },
  { name: '法国', lat: 46, lng: 2 },
  { name: '日本', lat: 36, lng: 138 },
  { name: '韩国', lat: 36, lng: 128 },
  { name: '埃及', lat: 26, lng: 30 },
  { name: '南非', lat: -30, lng: 25 },
  { name: '墨西哥', lat: 23, lng: -102 },
  { name: '阿根廷', lat: -38, lng: -63 },
]

const TEXTURE_URLS = [
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Earthmap1000x500compac.jpg/1024px-Earthmap1000x500compac.jpg',
]

const init = () => {
  clock = new THREE.Clock()
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020510)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 1, 3.5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.value?.appendChild(renderer.domElement)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  earthGroup = new THREE.Group()
  scene.add(earthGroup)

  scene.add(createStars())
  scene.add(createLights())

  loadTextureWithFallback().then((texture) => {
    earthMesh = createEarth(texture)
    earthGroup.add(earthMesh)

    cloudsMesh = createClouds()
    earthGroup.add(cloudsMesh)

    atmosphereMesh = createAtmosphere()
    earthGroup.add(atmosphereMesh)

    gridGroup = createGlowGrid()
    earthGroup.add(gridGroup)

    orbitRingsGroup = createOrbitRings()
    earthGroup.add(orbitRingsGroup)

    markersGroup = new THREE.Group()
    earthGroup.add(markersGroup)
    addMarkers()

    labelsGroup = new THREE.Group()
    earthGroup.add(labelsGroup)
    addCountryLabels()

    countryBordersGroup = new THREE.Group()
    earthGroup.add(countryBordersGroup)
    loadCountryBorders()

    isLoading.value = false
    animate()
  })

  setupEvents()
}

const loadTextureWithFallback = (): Promise<THREE.Texture> => {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'

    let tried = 0
    const tryLoad = () => {
      if (tried >= TEXTURE_URLS.length) {
        resolve(createProceduralTexture())
        return
      }
      loader.load(
        TEXTURE_URLS[tried],
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace
          tex.wrapS = THREE.RepeatWrapping
          tex.wrapT = THREE.ClampToEdgeWrapping
          tex.generateMipmaps = true
          tex.minFilter = THREE.LinearMipmapLinearFilter
          tex.magFilter = THREE.LinearFilter
          resolve(tex)
        },
        undefined,
        () => {
          tried++
          tryLoad()
        }
      )
    }
    tryLoad()
  })
}

const createProceduralTexture = (): THREE.Texture => {
  const c = document.createElement('canvas')
  c.width = 2048; c.height = 1024
  const ctx = c.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, c.width, c.height)
  g.addColorStop(0, '#0a3d62'); g.addColorStop(0.5, '#106090'); g.addColorStop(1, '#1570a0')
  ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height)

  const drawLand = (cx: number, cy: number, rx: number, ry: number) => {
    ctx.beginPath()
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2
      const fx = 1 + (Math.sin(a * 7) * 0.08 + Math.sin(a * 13) * 0.05)
      const fy = 1 + (Math.cos(a * 9) * 0.08 + Math.cos(a * 11) * 0.05)
      const x = cx + Math.cos(a) * rx * fx
      const y = cy + Math.sin(a) * ry * fy
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    const lg = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.2, 0, cx, cy, rx * 1.1)
    lg.addColorStop(0, '#4a7c2e'); lg.addColorStop(0.6, '#3c6e21'); lg.addColorStop(1, '#2d5016')
    ctx.fillStyle = lg; ctx.fill()
    ctx.strokeStyle = '#1a5f9a'; ctx.lineWidth = 3; ctx.stroke()
  }

  drawLand(220, 140, 180, 120)
  drawLand(500, 220, 160, 100)
  drawLand(730, 200, 220, 160)
  drawLand(960, 250, 130, 100)
  drawLand(1080, 420, 100, 90)
  drawLand(150, 490, 100, 30)
  drawLand(350, 550, 90, 40)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const createStars = () => {
  const geo = new THREE.BufferGeometry()
  const verts: number[] = []
  for (let i = 0; i < 5000; i++) {
    verts.push((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300)
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.8 }))
}

const createLights = () => {
  const a = new THREE.AmbientLight(0xffffff, 0.35)
  const d = new THREE.DirectionalLight(0xffffff, 1.8)
  d.position.set(5, 3, 5)
  const h = new THREE.HemisphereLight(0x87ceeb, 0x080820, 0.15)
  return [a, d, h]
}

const createEarth = (texture: THREE.Texture) => {
  const geo = new THREE.SphereGeometry(1, 80, 80)
  const mat = new THREE.MeshPhongMaterial({
    map: texture,
    specular: 0x222233,
    shininess: 15,
    bumpScale: 0.02,
  })
  return new THREE.Mesh(geo, mat)
}

const createClouds = () => {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 512
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * c.width, y = Math.random() * c.height, r = Math.random() * 50 + 15
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.6)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.2)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  const geo = new THREE.SphereGeometry(1.008, 48, 48)
  const mat = new THREE.MeshPhongMaterial({ map: tex, transparent: true, opacity: 0.35, depthWrite: false })
  return new THREE.Mesh(geo, mat)
}

const createAtmosphere = () => {
  const geo = new THREE.SphereGeometry(1.12, 48, 48)
  const vs = `
    varying vec3 vNorm;
    varying vec3 vPos;
    void main(){
      vNorm = normalize(normalMatrix * normal);
      vPos = (modelViewMatrix * vec4(position,1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `
  const fs = `
    varying vec3 vNorm;
    varying vec3 vPos;
    void main(){
      float f = pow(1.0 - abs(dot(normalize(-vPos), vNorm)), 3.0);
      vec3 col = mix(vec3(0.1,0.4,0.9), vec3(0.0,0.15,0.5), f);
      gl_FragColor = vec4(col, f * 0.5);
    }
  `
  const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
  return new THREE.Mesh(geo, mat)
}

const createGlowGrid = () => {
  const group = new THREE.Group()
  const gridColor = new THREE.Color(0x00d4ff)

  for (let lat = -80; lat <= 80; lat += 20) {
    const r = Math.cos((lat * Math.PI) / 180) * 1.002
    const geo = new THREE.RingGeometry(r - 0.001, r + 0.001, 128)
    const mat = new THREE.MeshBasicMaterial({ color: gridColor, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(geo, mat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = Math.sin((lat * Math.PI) / 180) * 1.002
    group.add(ring)
  }

  for (let lng = -180; lng < 180; lng += 30) {
    const verts: number[] = []
    for (let j = 0; j <= 60; j++) {
      const lat = -89 + (j / 60) * 178
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      verts.push(1.002 * Math.sin(phi) * Math.cos(theta), 1.002 * Math.cos(phi), 1.002 * Math.sin(phi) * Math.sin(theta))
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    const mat = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.18 })
    group.add(new THREE.Line(geo, mat))
  }

  return group
}

const createOrbitRings = () => {
  const group = new THREE.Group()
  const ringColor = 0x00d4ff

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.003, 8, 128),
    new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.3 })
  )
  ring1.rotation.x = Math.PI * 0.35
  ring1.rotation.z = Math.PI * 0.1
  group.add(ring1)

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.002, 8, 128),
    new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.2 })
  )
  ring2.rotation.x = Math.PI * 0.55
  ring2.rotation.z = -Math.PI * 0.15
  group.add(ring2)

  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.002, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.12 })
  )
  ring3.rotation.x = Math.PI * 0.2
  ring3.rotation.z = Math.PI * 0.3
  group.add(ring3)

  const dotGeo = new THREE.SphereGeometry(0.015, 8, 8)
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc })
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6)
    ring1.add(dot)
  }

  return group
}

const addMarkers = () => {
  markersGroup.clear()
  const markerGeo = new THREE.SphereGeometry(0.008, 8, 8)
  const glowGeo = new THREE.SphereGeometry(0.018, 8, 8)
  const catColors: Record<string, number> = { natural: 0x00ff88, cultural: 0xffcc00, urban: 0x00aaff, island: 0x00ffcc }

  attractions.forEach((a) => {
    const phi = (90 - a.latitude) * (Math.PI / 180)
    const theta = (a.longitude + 180) * (Math.PI / 180)
    const r = 1.006
    const x = -r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi)
    const z = r * Math.sin(phi) * Math.sin(theta)
    const col = catColors[a.category] || 0xff4444

    const m = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 }))
    m.position.set(x, y, z)
    m.userData = { attraction: a }
    markersGroup.add(m)

    const g = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.2 }))
    g.position.set(x, y, z)
    markersGroup.add(g)
  })
}

const addCountryLabels = () => {
  labelsGroup.clear()
  const lc = document.createElement('canvas')
  lc.width = 256; lc.height = 48
  const ctx = lc.getContext('2d')!

  countryLabels.forEach((c) => {
    ctx.clearRect(0, 0, lc.width, lc.height)
    ctx.font = 'bold 20px Microsoft YaHei, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4
    ctx.fillStyle = c.name === '中国' ? '#ff4444' : '#ffffff'
    ctx.fillText(c.name, lc.width / 2, lc.height / 2)
    ctx.shadowColor = 'transparent'

    const tex = new THREE.CanvasTexture(lc)
    tex.needsUpdate = true
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9 }))

    const phi = (90 - c.lat) * (Math.PI / 180)
    const theta = (c.lng + 180) * (Math.PI / 180)
    const r = 1.02
    sprite.position.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
    sprite.scale.set(0.12, 0.025, 1)
    labelsGroup.add(sprite)
  })
}

const GEOJSON_URLS = [
  'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
]

const loadCountryBorders = () => {
  fetch(GEOJSON_URLS[0])
    .then(res => {
      if (!res.ok) throw new Error('fetch failed')
      return res.json()
    })
    .then((geojson) => {
      renderCountryBorders(geojson)
    })
    .catch(() => {
      console.warn('Failed to load country borders GeoJSON')
    })
}

const renderCountryBorders = (geojson: any) => {
  const lineColor = new THREE.Color(0x00d4ff)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: lineColor,
    transparent: true,
    opacity: 0.35,
  })

  const glowMaterial = new THREE.LineBasicMaterial({
    color: lineColor,
    transparent: true,
    opacity: 0.12,
  })

  const R = 1.003

  const latLngToVector3 = (lat: number, lng: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -R * Math.sin(phi) * Math.cos(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(theta)
    )
  }

  const processCoordinates = (coords: number[][]) => {
    if (coords.length < 2) return
    const points: THREE.Vector3[] = []
    for (let i = 0; i < coords.length; i++) {
      const [lng, lat] = coords[i]
      points.push(latLngToVector3(lat, lng))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    countryBordersGroup.add(new THREE.Line(geometry, lineMaterial))

    const glowPoints: THREE.Vector3[] = []
    for (let i = 0; i < points.length - 1; i++) {
      glowPoints.push(points[i])
      const mid = new THREE.Vector3().addVectors(points[i], points[i + 1]).multiplyScalar(0.5)
      mid.normalize().multiplyScalar(R + 0.001)
      glowPoints.push(mid)
    }
    glowPoints.push(points[points.length - 1])
    const glowGeo = new THREE.BufferGeometry().setFromPoints(glowPoints)
    countryBordersGroup.add(new THREE.Line(glowGeo, glowMaterial))
  }

  const features = geojson.features || []
  features.forEach((feature: any) => {
    const geom = feature.geometry
    if (!geom) return

    if (geom.type === 'Polygon') {
      geom.coordinates.forEach((ring: number[][]) => processCoordinates(ring))
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((polygon: number[][][]) => {
        polygon.forEach((ring: number[][]) => processCoordinates(ring))
      })
    }
  })
}

const setupEvents = () => {
  const el = renderer.domElement
  el.addEventListener('mousedown', onMouseDown)
  el.addEventListener('mousemove', onMouseMove)
  el.addEventListener('mouseup', onMouseUp)
  el.addEventListener('wheel', onWheel)
  el.addEventListener('dblclick', onDoubleClick)
  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('touchend', onTouchEnd)
  window.addEventListener('resize', onResize)
}

let touchStartDist = 0
const onTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length === 1) {
    isDragging = true
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.touches.length === 2) {
    touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
  }
}
const onTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (e.touches.length === 1 && isDragging) {
    const dx = e.touches[0].clientX - previousMousePosition.x
    const dy = e.touches[0].clientY - previousMousePosition.y
    earthGroup.rotation.y += dx * 0.005
    earthGroup.rotation.x += dy * 0.005
    earthGroup.rotation.x = Math.max(-1.2, Math.min(1.2, earthGroup.rotation.x))
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    targetDistance += (touchStartDist - dist) * 0.01
    targetDistance = Math.max(1.5, Math.min(8, targetDistance))
    touchStartDist = dist
  }
}
const onTouchEnd = () => { isDragging = false }

const onMouseDown = (e: MouseEvent) => {
  isDragging = true
  previousMousePosition = { x: e.clientX, y: e.clientY }
}
const onMouseMove = (e: MouseEvent) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  if (isDragging) {
    const dx = e.clientX - previousMousePosition.x
    const dy = e.clientY - previousMousePosition.y
    earthGroup.rotation.y += dx * 0.005
    earthGroup.rotation.x += dy * 0.005
    earthGroup.rotation.x = Math.max(-1.2, Math.min(1.2, earthGroup.rotation.x))
    previousMousePosition = { x: e.clientX, y: e.clientY }
  }
}
const onMouseUp = () => { isDragging = false }
const onWheel = (e: WheelEvent) => {
  targetDistance += e.deltaY * 0.002
  targetDistance = Math.max(1.5, Math.min(8, targetDistance))
}
const onDoubleClick = (e: MouseEvent) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(markersGroup.children)
  if (hits.length > 0) {
    const a = hits[0].object.userData.attraction as Attraction
    if (a) { emit('select-attraction', a); flyTo(a.latitude, a.longitude) }
  }
}
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  const dt = clock.getDelta()

  if (!isDragging) {
    earthGroup.rotation.y += autoRotateSpeed
  }

  currentDistance += (targetDistance - currentDistance) * 0.08
  camera.position.z = currentDistance * Math.cos(earthGroup.rotation.x * 0.3)
  camera.position.y = currentDistance * Math.sin(earthGroup.rotation.x * 0.3) * 0.5
  camera.position.x = 0
  camera.lookAt(0, 0, 0)

  if (cloudsMesh) cloudsMesh.rotation.y += 0.00015
  if (orbitRingsGroup) {
    orbitRingsGroup.rotation.y += 0.001
    orbitRingsGroup.children.forEach((ring, i) => {
      ring.rotation.z += 0.0003 * (i + 1)
    })
  }

  const time = clock.elapsedTime
  markersGroup.children.forEach((child, i) => {
    if (i % 2 === 1 && child.material) {
      (child.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(time * 2 + i) * 0.1
    }
  })

  renderer.render(scene, camera)
}

const flyTo = (lat: number, lng: number) => {
  const targetRotY = -((lng + 180) * Math.PI) / 180 + Math.PI
  const startRotY = earthGroup.rotation.y
  const startTime = Date.now()
  const duration = 1500

  const anim = () => {
    const p = Math.min((Date.now() - startTime) / duration, 1)
    const e = 1 - Math.pow(1 - p, 3)
    earthGroup.rotation.y = startRotY + (targetRotY - startRotY) * e
    if (p < 1) requestAnimationFrame(anim)
  }
  anim()
  targetDistance = 2.2
}

const resetView = () => {
  earthGroup.rotation.set(0, 0, 0)
  targetDistance = 3.5
}

defineExpose({ flyTo, resetView })

onMounted(() => { init() })
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})
</script>

<style scoped>
.earth-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.loading-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #020510 0%, #000510 100%);
  z-index: 1000;
}
.loading-spinner {
  width: 60px; height: 60px;
  border: 3px solid rgba(0, 212, 255, 0.15);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  margin-top: 20px;
  color: rgba(0, 212, 255, 0.8);
  font-size: 16px;
  font-family: 'Microsoft YaHei', sans-serif;
  letter-spacing: 2px;
}
</style>
