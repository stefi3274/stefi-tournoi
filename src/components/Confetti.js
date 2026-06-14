// ── Confettis animés ──

const COLORS = ['#00FF87', '#A855F7', '#FFD700', '#60A5FA', '#F472B6', '#34D399']
let cfs = [], W, H, ctx

export function initConfetti() {
  const canvas = document.getElementById('confetti-canvas')
  if (!canvas) return
  ctx = canvas.getContext('2d')

  function resize() {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  setInterval(() => spawnCf(3), 320)
  animateCf()
}

function spawnCf(n) {
  for (let i = 0; i < n; i++) {
    cfs.push({
      x: Math.random() * W, y: Math.random() * -80,
      w: Math.random() * 8 + 3, h: Math.random() * 14 + 5,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      r: Math.random() * 360,
      vx: (Math.random() - .5) * 1.5, vy: Math.random() * 2 + .7,
      vr: (Math.random() - .5) * 4, o: Math.random() * .6 + .3,
    })
  }
}

function animateCf() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  cfs = cfs.filter(c => c.y < H + 50)
  cfs.forEach(c => {
    c.x += c.vx; c.y += c.vy; c.r += c.vr
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.rotate(c.r * Math.PI / 180)
    ctx.globalAlpha = c.o
    ctx.fillStyle = c.c
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
    ctx.restore()
  })
  requestAnimationFrame(animateCf)
}

export function burstConfetti() {
  for (let i = 0; i < 100; i++) {
    cfs.push({
      x: W / 2 + (Math.random() - .5) * 600,
      y: H / 2 + (Math.random() - .5) * 200,
      w: Math.random() * 10 + 4, h: Math.random() * 16 + 6,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      r: Math.random() * 360,
      vx: (Math.random() - .5) * 10, vy: Math.random() * -12 - 2,
      vr: (Math.random() - .5) * 9, o: .9,
    })
  }
}
