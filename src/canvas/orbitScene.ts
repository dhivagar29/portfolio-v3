/**
 * Hero backdrop: a planet horizon seen from orbit, with a release pipeline
 * drawn as the orbit above it. Releases travel along the orbit through four
 * stations (CI, SCAN, GATE, DEPLOY). A scan flags some of them, the gate stops
 * the flagged ones, and the rest descend to the surface.
 *
 * Plain Canvas 2D, no dependencies. Purely decorative.
 */

export interface OrbitSceneOptions {
  /** Station labels, in order. Exactly four are drawn. */
  stages: readonly string[]
  /** When true a single still frame is drawn and nothing animates. */
  reducedMotion: boolean
  /** CSS font-family used for the station labels. */
  fontFamily: string
}

const TAU = Math.PI * 2
const CYAN = '53, 240, 255'
const ICE = '200, 250, 255'
const VIOLET = '122, 92, 255'
const HOT = '255, 90, 43'
const HOT_SOFT = '255, 160, 110'
const DIM = '150, 166, 214'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Small deterministic PRNG so every visit draws the same sky. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash2 = (a: number, b: number) => {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Tileable (in u) value noise table, used for the cloud pattern on the surface. */
const NOISE_W = 256
const NOISE_H = 64
function buildNoise(rand: () => number): Float32Array {
  const out = new Float32Array(NOISE_W * NOISE_H)
  const octaves = [
    { gw: 16, gh: 4, amp: 0.6 },
    { gw: 48, gh: 12, amp: 0.4 },
  ]
  for (const { gw, gh, amp } of octaves) {
    const grid = new Float32Array(gw * (gh + 1))
    for (let i = 0; i < grid.length; i++) grid[i] = rand()
    for (let y = 0; y < NOISE_H; y++) {
      const gy = (y / NOISE_H) * gh
      const y0 = Math.floor(gy)
      const fy = gy - y0
      const sy = fy * fy * (3 - 2 * fy)
      for (let x = 0; x < NOISE_W; x++) {
        const gx = (x / NOISE_W) * gw
        const x0 = Math.floor(gx)
        const x1 = (x0 + 1) % gw
        const fx = gx - x0
        const sx = fx * fx * (3 - 2 * fx)
        const top = mix(grid[y0 * gw + x0], grid[y0 * gw + x1], sx)
        const bottom = mix(grid[(y0 + 1) * gw + x0], grid[(y0 + 1) * gw + x1], sx)
        out[y * NOISE_W + x] += mix(top, bottom, sy) * amp
      }
    }
  }
  return out
}

interface Star {
  x: number
  y: number
  size: number
  alpha: number
  speed: number
  phase: number
}

const FLOW = 0
const BLOCKED = 1
const DEPLOYING = 2
const DEAD = 3

interface Release {
  angle: number
  lane: number
  speed: number
  flagged: boolean
  /** Number of stations already passed (0 to 4). */
  passed: number
  state: number
  /** Seconds spent in the current state. */
  clock: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
}

interface Ripple {
  angle: number
  life: number
}

function makeGlow(rgb: string): HTMLCanvasElement {
  const size = 64
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = size
  const g = sprite.getContext('2d')
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, `rgba(${rgb}, 1)`)
    grad.addColorStop(0.18, `rgba(${rgb}, 0.55)`)
    grad.addColorStop(0.5, `rgba(${rgb}, 0.12)`)
    grad.addColorStop(1, `rgba(${rgb}, 0)`)
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
  }
  return sprite
}

export function startOrbitScene(canvas: HTMLCanvasElement, options: OrbitSceneOptions): () => void {
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  const ctx: CanvasRenderingContext2D = context

  const rand = mulberry32(0x0d1c0de)
  const noise = buildNoise(mulberry32(0x5eed))
  const glowCyan = makeGlow(CYAN)
  const glowHot = makeGlow(HOT)
  const glowIce = makeGlow(ICE)
  const backdrop = document.createElement('canvas')
  const stages = options.stages.slice(0, 4)
  const still = options.reducedMotion

  // Geometry (CSS pixels), recomputed on resize.
  let W = 0
  let H = 0
  let dpr = 1
  let wide = false
  let R = 0
  let cx = 0
  let cy = 0
  let orbitR = 0
  let apex = 0
  let angleMin = 0
  let angleMax = 0
  let sunAngle = 0
  let landAngle = 0
  let stationAngles: number[] = []
  let stars: Star[] = []
  const PAD = 24

  // Simulation state.
  let releases: Release[] = []
  const sparks: Spark[] = []
  const ripples: Ripple[] = []
  const pulses = [0, 0, 0, 0]
  let gateHeat = 0
  let spawnIn = 0
  let serial = 0
  let time = 0
  let last = 0
  let frame = 0
  let running = false
  let visible = true
  let pointerX = 0
  let pointerY = 0
  let shiftX = 0
  let shiftY = 0

  const orbitPoint = (angle: number, offset = 0): [number, number] => [
    cx + (orbitR + offset) * Math.sin(angle),
    cy - (orbitR + offset) * Math.cos(angle),
  ]
  const limbPoint = (angle: number, offset = 0): [number, number] => [
    cx + (R + offset) * Math.sin(angle),
    cy - (R + offset) * Math.cos(angle),
  ]

  function newRelease(angle: number): Release {
    serial += 1
    const speedPx = wide ? mix(64, 92, rand()) : mix(40, 58, rand())
    return {
      angle,
      lane: (rand() - 0.5) * (wide ? 9 : 6),
      speed: speedPx / orbitR,
      // Roughly one release in four fails the scan.
      flagged: hash2(serial, 7) < 0.26,
      passed: 0,
      state: FLOW,
      clock: 0,
    }
  }

  function seedReleases() {
    releases = []
    sparks.length = 0
    ripples.length = 0
    const gap = (wide ? 88 : 62) / orbitR
    for (let a = angleMin + gap * 0.4; a < stationAngles[3] - gap * 0.2; a += gap * mix(0.8, 1.3, rand())) {
      const release = newRelease(a)
      for (let i = 0; i < 4; i++) if (a > stationAngles[i]) release.passed = i + 1
      // Flagged releases never get past the gate.
      if (release.flagged && release.passed >= 3) release.flagged = false
      releases.push(release)
    }
    if (still) {
      // One release mid-descent and one landing ring, so the still frame tells the whole story.
      const descending = newRelease(stationAngles[3])
      descending.flagged = false
      descending.passed = 4
      descending.state = DEPLOYING
      descending.clock = 0.62
      releases.push(descending)
      ripples.push({ angle: landAngle, life: 0.35 })
    }
    spawnIn = 0.4
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    W = Math.max(1, Math.round(rect.width))
    H = Math.max(1, Math.round(rect.height))
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    wide = W >= 900

    R = wide ? clamp(W * 0.95, 900, 1900) : clamp(W * 1.7, 600, 1300)
    apex = wide ? clamp(H * 0.2, 130, 220) : clamp(H * 0.15, 96, 150)
    cx = W * (wide ? 0.56 : 0.5)
    cy = H - apex + R
    orbitR = R + (wide ? 104 : 68)

    const toAngle = (x: number, radius: number) => Math.asin(clamp((x - cx) / radius, -1, 1))
    angleMin = toAngle(-40, orbitR)
    angleMax = toAngle(W + 40, orbitR)
    stationAngles = (wide ? [0.14, 0.38, 0.62, 0.84] : [0.11, 0.37, 0.63, 0.87]).map((f) =>
      toAngle(f * W, orbitR),
    )
    sunAngle = toAngle(W * (wide ? 0.73 : 0.5), R)
    landAngle = stationAngles[3] + (wide ? 92 : 44) / R

    const starRand = mulberry32(0xa57e12)
    const count = Math.round(clamp((W * H) / 8500, 50, 190))
    stars = []
    for (let i = 0; i < count; i++) {
      stars.push({
        x: starRand() * W,
        y: starRand() * H,
        size: mix(0.6, 1.5, starRand() ** 2),
        alpha: mix(0.18, 0.75, starRand() ** 1.6),
        speed: mix(0.4, 1.6, starRand()),
        phase: starRand() * TAU,
      })
    }

    paintBackdrop()
    seedReleases()
    if (!running) draw()
  }

  /** Everything that does not change frame to frame: glow, planet body, rim and sunrise. */
  function paintBackdrop() {
    backdrop.width = Math.round((W + PAD * 2) * dpr)
    backdrop.height = Math.round((H + PAD * 2) * dpr)
    const b = backdrop.getContext('2d')
    if (!b) return
    b.setTransform(dpr, 0, 0, dpr, PAD * dpr, PAD * dpr)
    b.clearRect(-PAD, -PAD, W + PAD * 2, H + PAD * 2)

    const [sx, sy] = limbPoint(sunAngle)
    const reach = wide ? 190 : 130

    // Atmosphere: a thin bright shell fading into violet.
    const air = b.createRadialGradient(cx, cy, R, cx, cy, R + reach)
    air.addColorStop(0, `rgba(${CYAN}, 0.34)`)
    air.addColorStop(0.06, `rgba(80, 170, 255, 0.2)`)
    air.addColorStop(0.3, `rgba(${VIOLET}, 0.09)`)
    air.addColorStop(1, `rgba(${VIOLET}, 0)`)
    b.fillStyle = air
    b.fillRect(-PAD, -PAD, W + PAD * 2, H + PAD * 2)

    // Sunrise bloom behind the limb.
    const bloomR = wide ? 300 : 190
    const bloom = b.createRadialGradient(sx, sy, 0, sx, sy, bloomR)
    bloom.addColorStop(0, `rgba(255, 226, 190, 0.9)`)
    bloom.addColorStop(0.05, `rgba(${HOT_SOFT}, 0.6)`)
    bloom.addColorStop(0.22, `rgba(${HOT}, 0.2)`)
    bloom.addColorStop(0.55, `rgba(${VIOLET}, 0.07)`)
    bloom.addColorStop(1, `rgba(${VIOLET}, 0)`)
    b.globalCompositeOperation = 'lighter'
    b.fillStyle = bloom
    b.fillRect(sx - bloomR, sy - bloomR, bloomR * 2, bloomR * 2)
    b.globalCompositeOperation = 'source-over'

    // Planet body, slightly lit at the edge and falling into the page background.
    const body = b.createRadialGradient(cx, cy, R - apex * 1.25, cx, cy, R)
    body.addColorStop(0, 'rgb(4, 5, 11)')
    body.addColorStop(0.7, 'rgb(6, 8, 22)')
    body.addColorStop(1, 'rgb(11, 16, 44)')
    b.fillStyle = body
    b.beginPath()
    b.arc(cx, cy, R, 0, TAU)
    b.fill()

    // Rim light: faint along the whole horizon, bright around the sunrise.
    const start = -Math.PI / 2 + angleMin - 0.05
    const end = -Math.PI / 2 + angleMax + 0.05
    b.lineWidth = 1
    b.strokeStyle = `rgba(${CYAN}, 0.32)`
    b.beginPath()
    b.arc(cx, cy, R, start, end)
    b.stroke()

    const span = wide ? 520 : 300
    const rim = b.createLinearGradient(sx - span, 0, sx + span, 0)
    rim.addColorStop(0, `rgba(${ICE}, 0)`)
    rim.addColorStop(0.42, `rgba(${ICE}, 0.75)`)
    rim.addColorStop(0.5, 'rgba(255, 244, 230, 1)')
    rim.addColorStop(0.58, `rgba(${ICE}, 0.75)`)
    rim.addColorStop(1, `rgba(${ICE}, 0)`)
    b.globalCompositeOperation = 'lighter'
    b.strokeStyle = rim
    for (const width of [5, 2.2, 1.2]) {
      b.lineWidth = width
      b.globalAlpha = width > 3 ? 0.22 : 0.9
      b.beginPath()
      b.arc(cx, cy, R, start, end)
      b.stroke()
    }
    b.globalAlpha = 1

    // Anamorphic streak and core glint at the sunrise point.
    b.save()
    b.translate(sx, sy)
    b.rotate(sunAngle)
    b.scale(1, 0.028)
    const streakR = wide ? 420 : 240
    const streak = b.createRadialGradient(0, 0, 0, 0, 0, streakR)
    streak.addColorStop(0, 'rgba(255, 246, 236, 0.95)')
    streak.addColorStop(0.3, `rgba(${ICE}, 0.4)`)
    streak.addColorStop(1, `rgba(${CYAN}, 0)`)
    b.fillStyle = streak
    b.beginPath()
    b.arc(0, 0, streakR, 0, TAU)
    b.fill()
    b.restore()

    const core = b.createRadialGradient(sx, sy, 0, sx, sy, 26)
    core.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    core.addColorStop(0.3, 'rgba(255, 214, 180, 0.4)')
    core.addColorStop(1, 'rgba(255, 160, 110, 0)')
    b.fillStyle = core
    b.fillRect(sx - 26, sy - 26, 52, 52)
    b.globalCompositeOperation = 'source-over'
  }

  function sampleNoise(u: number, v: number) {
    const x = Math.floor((((u % 1) + 1) % 1) * NOISE_W) % NOISE_W
    const y = clamp(Math.floor(v), 0, NOISE_H - 1)
    return noise[y * NOISE_W + x]
  }

  /** Dot lattice on the visible cap of the planet, drifting along the horizon. */
  function drawSurface() {
    const spacing = wide ? 16 : 12.5
    const dTheta = spacing / R
    const thetaMax = Math.acos(clamp(1 - (apex + 30) / R, -1, 1))
    const rotation = time * (wide ? 0.0075 : 0.011)
    const drift = time * 0.004
    const dot = wide ? 1.7 : 1.5
    const margin = 12

    ctx.globalCompositeOperation = 'lighter'
    for (let j = 0, theta = dTheta * 0.4; theta < thetaMax; j++, theta += dTheta) {
      const r = R * Math.cos(theta)
      const sinTheta = Math.sin(theta)
      const dPhi = spacing / r
      const lo = Math.asin(clamp((-margin - cx) / r, -1, 1))
      const hi = Math.asin(clamp((W + margin - cx) / r, -1, 1))
      const kStart = Math.ceil((lo - rotation) / dPhi)
      const kEnd = Math.floor((hi - rotation) / dPhi)
      // Bright at the horizon, fading with depth.
      const depth = 0.5 * Math.exp(-theta / 0.2) + 0.1
      const height = Math.max(0.7, dot * Math.min(1, sinTheta * 3.4))
      const tint = smooth(0.02, 0.3, theta)
      ctx.fillStyle = `rgb(${Math.round(mix(120, 122, tint))}, ${Math.round(mix(238, 132, tint))}, 255)`
      const v = (j * 1.35) % NOISE_H
      for (let k = kStart; k <= kEnd; k++) {
        const planetAngle = k * dPhi
        const a = planetAngle + rotation
        const y = cy - r * Math.cos(a)
        if (y > H + 2) continue
        const u = planetAngle / TAU
        const cloud = smooth(
          0.38,
          0.72,
          sampleNoise(u * 9, v) * 0.65 + sampleNoise(u * 21 + drift, v + 9) * 0.35,
        )
        const twinkle = still ? 1 : 0.82 + 0.18 * Math.sin(time * 1.3 + hash2(j, k) * TAU)
        const alpha = depth * (0.16 + 0.84 * cloud) * twinkle
        if (alpha < 0.02) continue
        ctx.globalAlpha = alpha
        ctx.fillRect(cx + r * Math.sin(a) - dot / 2, y - height / 2, dot, height)
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  function drawStars() {
    ctx.fillStyle = 'rgb(214, 226, 255)'
    const limit = (R + 8) * (R + 8)
    for (const star of stars) {
      const dx = star.x - cx
      const dy = star.y - cy
      if (dx * dx + dy * dy < limit) continue
      const twinkle = still ? 0.85 : 0.72 + 0.28 * Math.sin(time * star.speed + star.phase)
      ctx.globalAlpha = star.alpha * twinkle
      ctx.fillRect(star.x, star.y, star.size, star.size)
    }
    ctx.globalAlpha = 1
  }

  function drawLabel(text: string, x: number, y: number, size: number, color: string) {
    ctx.font = `500 ${size}px ${options.fontFamily}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const tracking = size * 0.2
    const upper = text.toUpperCase()
    let width = -tracking
    for (const ch of upper) width += ctx.measureText(ch).width + tracking
    let cursor = x - width / 2
    ctx.fillStyle = color
    for (const ch of upper) {
      ctx.fillText(ch, cursor, y)
      cursor += ctx.measureText(ch).width + tracking
    }
  }

  function deployPoint(t: number): [number, number] {
    const [x0, y0] = orbitPoint(stationAngles[3])
    const [x1, y1] = orbitPoint(mix(stationAngles[3], landAngle, 0.8), 6)
    const [x2, y2] = limbPoint(landAngle)
    const u = 1 - t
    return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2]
  }

  function drawOrbit() {
    const start = -Math.PI / 2 + angleMin
    const end = -Math.PI / 2 + angleMax

    // Orbit track.
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(150, 170, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(cx, cy, orbitR, start, end)
    ctx.stroke()
    ctx.setLineDash([2, 7])
    ctx.strokeStyle = 'rgba(170, 190, 255, 0.42)'
    ctx.beginPath()
    ctx.arc(cx, cy, orbitR, start, -Math.PI / 2 + stationAngles[3])
    ctx.stroke()

    // Descent path from DEPLOY to the surface.
    ctx.strokeStyle = `rgba(${CYAN}, 0.3)`
    ctx.beginPath()
    for (let i = 0; i <= 16; i++) {
      const [x, y] = deployPoint(i / 16)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    const labelSize = wide ? 11 : 10
    for (let i = 0; i < stationAngles.length; i++) {
      const angle = stationAngles[i]
      const [x, y] = orbitPoint(angle)
      const nx = Math.sin(angle)
      const ny = -Math.cos(angle)
      const pulse = pulses[i]
      const isGate = i === 2
      const heat = isGate ? gateHeat : 0
      const rgb = heat > 0.05 ? HOT : CYAN

      if (isGate) {
        // Two bars across the track.
        const tx = Math.cos(angle)
        const ty = Math.sin(angle)
        ctx.lineWidth = 1.6
        ctx.strokeStyle = `rgba(${rgb}, ${0.75 + heat * 0.25})`
        for (const side of [-1, 1]) {
          const bx = x + tx * 6 * side
          const by = y + ty * 6 * side
          ctx.beginPath()
          ctx.moveTo(bx - nx * 13, by - ny * 13)
          ctx.lineTo(bx + nx * 13, by + ny * 13)
          ctx.stroke()
        }
        if (heat > 0.02) {
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = heat * 0.8
          ctx.drawImage(glowHot, x - 34, y - 34, 68, 68)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
        }
      } else {
        ctx.fillStyle = 'rgb(5, 7, 18)'
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, TAU)
        ctx.fill()
        ctx.lineWidth = 1.2
        ctx.strokeStyle = `rgba(${CYAN}, 0.8)`
        ctx.stroke()
        ctx.fillStyle = `rgba(${ICE}, 0.95)`
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, TAU)
        ctx.fill()
        if (i === 1) {
          // Scanner: a slowly turning broken ring.
          ctx.setLineDash([5, 6])
          ctx.strokeStyle = `rgba(${CYAN}, 0.45)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(x, y, 15, time * 0.9, time * 0.9 + TAU)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      if (pulse > 0.01) {
        const grow = 1 - pulse
        ctx.strokeStyle = `rgba(${rgb}, ${pulse * 0.7})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, 9 + grow * 22, 0, TAU)
        ctx.stroke()
      }

      // Leader line and label, pointing away from the planet.
      const from = isGate ? 18 : 14
      ctx.strokeStyle = 'rgba(170, 190, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + nx * from, y + ny * from)
      ctx.lineTo(x + nx * (from + 12), y + ny * (from + 12))
      ctx.stroke()
      const lx = x + nx * (from + 24)
      const ly = y + ny * (from + 24)
      drawLabel(
        stages[i] ?? '',
        lx,
        ly,
        labelSize,
        heat > 0.05 ? `rgba(${HOT_SOFT}, 1)` : 'rgba(214, 226, 255, 0.92)',
      )
    }
  }

  function drawReleases() {
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    for (const release of releases) {
      if (release.state === DEAD) continue
      const built = release.passed >= 1
      const flagged = release.flagged && release.passed >= 2
      const cleared = release.passed >= 3
      const rgb = flagged ? HOT : built ? CYAN : DIM
      const sprite = flagged ? glowHot : cleared ? glowIce : glowCyan

      let x: number
      let y: number
      let tailX: number
      let tailY: number
      let fade = 1
      let size = built ? (wide ? 22 : 18) : 12

      if (release.state === DEPLOYING) {
        const t = clamp(release.clock, 0, 1)
        const eased = t * t
        ;[x, y] = deployPoint(eased)
        ;[tailX, tailY] = deployPoint(Math.max(0, eased - 0.2))
        size = wide ? 26 : 20
      } else {
        ;[x, y] = orbitPoint(release.angle, release.lane)
        const tail = (built ? (wide ? 46 : 30) : 16) / orbitR
        ;[tailX, tailY] = orbitPoint(release.angle - tail, release.lane)
        if (release.state === BLOCKED) {
          fade = clamp(1 - release.clock / 0.55, 0, 1)
          x += Math.sin(release.clock * 70) * 1.5 * fade
        }
        // Ease in at the left edge.
        fade *= smooth(angleMin, angleMin + 60 / orbitR, release.angle)
      }

      const trail = ctx.createLinearGradient(tailX, tailY, x, y)
      trail.addColorStop(0, `rgba(${rgb}, 0)`)
      trail.addColorStop(1, `rgba(${rgb}, ${(built ? 0.75 : 0.35) * fade})`)
      ctx.strokeStyle = trail
      ctx.lineWidth = built ? 1.6 : 1
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(x, y)
      ctx.stroke()

      ctx.globalAlpha = (built ? 0.95 : 0.5) * fade
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size)
      ctx.globalAlpha = 1
    }

    for (const spark of sparks) {
      const k = 1 - spark.life / spark.ttl
      ctx.globalAlpha = k
      ctx.drawImage(glowHot, spark.x - 5, spark.y - 5, 10, 10)
    }
    ctx.globalAlpha = 1

    // Landing rings on the surface.
    for (const ripple of ripples) {
      const k = clamp(ripple.life / 1.3, 0, 1)
      const [x, y] = limbPoint(ripple.angle, -1)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(ripple.angle)
      ctx.strokeStyle = `rgba(${ICE}, ${(1 - k) * 0.9})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.ellipse(0, 3 + k * 5, 6 + k * 46, 1 + k * 7, 0, 0, TAU)
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = (1 - k) * 0.9
      ctx.drawImage(glowIce, x - 20, y - 20, 40, 40)
      ctx.globalAlpha = 1
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  function step(dt: number) {
    time += dt
    shiftX += (pointerX - shiftX) * Math.min(1, dt * 3)
    shiftY += (pointerY - shiftY) * Math.min(1, dt * 3)
    for (let i = 0; i < pulses.length; i++) pulses[i] = Math.max(0, pulses[i] - dt * 1.6)
    gateHeat = Math.max(0, gateHeat - dt * 1.5)

    spawnIn -= dt
    if (spawnIn <= 0) {
      releases.push(newRelease(angleMin))
      spawnIn = mix(0.75, 1.5, rand())
    }

    for (const release of releases) {
      release.clock += dt
      if (release.state === FLOW) {
        release.angle += release.speed * dt
        while (release.passed < 4 && release.angle >= stationAngles[release.passed]) {
          const station = release.passed
          release.passed += 1
          pulses[station] = 1
          if (station === 2 && release.flagged) {
            // Fail closed: the gate stops anything the scan flagged.
            release.state = BLOCKED
            release.clock = 0
            release.angle = stationAngles[2] - 9 / orbitR
            gateHeat = 1
            const [x, y] = orbitPoint(release.angle, release.lane)
            for (let i = 0; i < 9; i++) {
              const a = sunAngle + Math.PI + (rand() - 0.5) * 2.4
              const v = mix(30, 110, rand())
              sparks.push({
                x,
                y,
                vx: Math.cos(a) * v - 20,
                vy: Math.sin(a) * v * 0.6 - 30,
                life: 0,
                ttl: mix(0.45, 0.95, rand()),
              })
            }
            break
          }
          if (station === 3) {
            release.state = DEPLOYING
            release.clock = 0
            break
          }
        }
      } else if (release.state === BLOCKED) {
        if (release.clock > 0.55) release.state = DEAD
      } else if (release.state === DEPLOYING) {
        // `clock` doubles as progress along the descent (about 1.1 s).
        release.clock += dt * (1 / 1.1 - 1)
        if (release.clock >= 1) {
          release.state = DEAD
          ripples.push({ angle: landAngle, life: 0 })
        }
      }
    }
    releases = releases.filter((release) => release.state !== DEAD)

    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i]
      spark.life += dt
      spark.vy += 120 * dt
      spark.x += spark.vx * dt
      spark.y += spark.vy * dt
      if (spark.life >= spark.ttl) sparks.splice(i, 1)
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].life += dt
      if (ripples[i].life >= 1.3) ripples.splice(i, 1)
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    ctx.save()
    ctx.translate(shiftX * -4, shiftY * -3)
    drawStars()
    ctx.restore()

    const px = shiftX * -10
    const py = shiftY * -6
    ctx.drawImage(backdrop, px - PAD, py - PAD, W + PAD * 2, H + PAD * 2)
    ctx.save()
    ctx.translate(px, py)
    drawSurface()
    ctx.translate(shiftX * -4, shiftY * -2)
    drawOrbit()
    drawReleases()
    ctx.restore()
  }

  function loop(now: number) {
    frame = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    step(dt)
    draw()
  }

  function setRunning(next: boolean) {
    if (next === running) return
    running = next
    if (running) {
      last = performance.now()
      frame = requestAnimationFrame(loop)
    } else {
      cancelAnimationFrame(frame)
    }
  }

  const sync = () => setRunning(!still && visible && !document.hidden)

  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    pointerX = (event.clientX / window.innerWidth) * 2 - 1
    pointerY = (event.clientY / window.innerHeight) * 2 - 1
  }

  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(canvas)
  const viewObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting
      sync()
    },
    { threshold: 0 },
  )
  viewObserver.observe(canvas)
  document.addEventListener('visibilitychange', sync)
  if (!still) window.addEventListener('pointermove', onPointer, { passive: true })

  resize()
  sync()
  // Labels are drawn with a web font; repaint once it is ready.
  document.fonts?.ready.then(() => {
    if (!running) draw()
  })

  return () => {
    setRunning(false)
    resizeObserver.disconnect()
    viewObserver.disconnect()
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('pointermove', onPointer)
  }
}
