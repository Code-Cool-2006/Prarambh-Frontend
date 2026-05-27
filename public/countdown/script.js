/* ============================================================
   PRARAMBH — script.js
   ============================================================ */

/* ── 1. Countdown ─────────────────────────────────────────── */

// Target: 29 May 2026, 9:55 AM IST (UTC+5:30)
const TARGET = new Date('2026-05-29T09:55:00+05:30').getTime();

const elDays    = document.getElementById('days');
const elHours   = document.getElementById('hours');
const elMins    = document.getElementById('minutes');
const elSecs    = document.getElementById('seconds');
const elCountdown = document.getElementById('countdown');
const elTeases    = document.getElementById('teases');
const elShowtime  = document.getElementById('showtime');

function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

function setFlip(el, val) {
  const s = pad(val);
  if (el.textContent !== s) {
    el.classList.remove('flip');
    void el.offsetWidth;
    el.textContent = s;
    el.classList.add('flip');
  }
}

function tick() {
  const diff = TARGET - Date.now();
  if (diff <= 0) {
    clearInterval(timerId);
    elCountdown.style.display  = 'none';
    elTeases.style.display     = 'none';
    elShowtime.classList.add('visible');
    launchShockwave();
    return;
  }
  const tot = Math.floor(diff / 1000);
  setFlip(elDays,  Math.floor(tot / 86400));
  setFlip(elHours, Math.floor((tot % 86400) / 3600));
  setFlip(elMins,  Math.floor((tot % 3600) / 60));
  setFlip(elSecs,  tot % 60);
}

tick();
const timerId = setInterval(tick, 1000);


/* ── 2. Rotating suspense lines ───────────────────────────── */

const LINES = [
  "What happens when you least expect it?",
  "Three rounds. No spoilers.",
  "Think you know what's coming? You don't.",
  "Every answer leads to a new question.",
  "The rules will surprise you.",
  "Are your instincts ready?",
  "Some games are played with your mind. Some with your feet.",
  "Your points. Your power. Your choice.",
  "Nothing is what it seems.",
  "The beginning is only the beginning.",
];

let lineIdx = 0;
const lineEl = document.getElementById('rotating-line');

function rotateLine() {
  lineEl.classList.add('fade-out');
  setTimeout(() => {
    lineIdx = (lineIdx + 1) % LINES.length;
    lineEl.textContent = LINES[lineIdx];
    lineEl.classList.remove('fade-out');
  }, 500);
}
setInterval(rotateLine, 3200);


/* ── 3. Background canvas — grid + floating orbs ─────────── */

const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* Grid dots */
function drawGrid(t) {
  ctx.clearRect(0, 0, W, H);

  const spacing = 48;
  const cols = Math.ceil(W / spacing) + 1;
  const rows = Math.ceil(H / spacing) + 1;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * spacing;
      const y = r * spacing;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.0008 + c * 0.4 + r * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${0.06 * pulse})`;
      ctx.fill();
    }
  }
}

/* Orbs */
const ORBS = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * 1200,
  y: Math.random() * 800,
  r: 120 + Math.random() * 180,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.12,
  hue: i < 2 ? 'cyan' : i < 4 ? 'saffron' : 'red',
  speed: 0.0003 + Math.random() * 0.0004,
  offset: Math.random() * Math.PI * 2,
}));

const ORB_COLORS = {
  cyan:    [0, 229, 255],
  saffron: [255, 140, 0],
  red:     [255, 45, 45],
};

function drawOrbs(t) {
  ORBS.forEach(o => {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < -o.r) o.x = W + o.r;
    if (o.x > W + o.r) o.x = -o.r;
    if (o.y < -o.r) o.y = H + o.r;
    if (o.y > H + o.r) o.y = -o.r;

    const alpha = 0.035 + 0.02 * Math.sin(t * o.speed + o.offset);
    const [r, g, b] = ORB_COLORS[o.hue];
    const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });
}

/* Sparks */
const SPARKS = Array.from({ length: 60 }, () => newSpark());
function newSpark() {
  return {
    x: Math.random() * 1600,
    y: Math.random() * 900,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(Math.random() * 0.4 + 0.1),
    size: Math.random() * 1.8 + 0.3,
    alpha: Math.random() * 0.5 + 0.1,
    life: 0,
    maxLife: 200 + Math.random() * 300,
    color: Math.random() > 0.5 ? '0,229,255' : '255,140,0',
  };
}

function drawSparks() {
  SPARKS.forEach((s, i) => {
    s.x += s.vx; s.y += s.vy; s.life++;
    const fade = s.life > s.maxLife * 0.75 ? 1 - (s.life - s.maxLife * 0.75) / (s.maxLife * 0.25) : 1;
    ctx.beginPath();
    ctx.arc(
      (s.x / 1600) * W,
      (s.y / 900)  * H,
      s.size, 0, Math.PI * 2
    );
    ctx.fillStyle = `rgba(${s.color},${s.alpha * fade})`;
    ctx.shadowBlur = s.size * 4;
    ctx.shadowColor = `rgba(${s.color},0.7)`;
    ctx.fill();
    ctx.shadowBlur = 0;
    if (s.life >= s.maxLife || s.y < 0) SPARKS[i] = newSpark();
  });
}

/* Horizontal scan line */
let scanY = 0;
function drawScanLine(t) {
  scanY = (t * 0.04) % H;
  const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
  grad.addColorStop(0, 'rgba(0,229,255,0)');
  grad.addColorStop(0.5, 'rgba(0,229,255,0.025)');
  grad.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 40, W, 80);
}

let frameId;
function loop(t) {
  drawGrid(t);
  drawOrbs(t);
  drawSparks();
  drawScanLine(t);
  frameId = requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


/* ── 4. Shockwave on event start ──────────────────────────── */

function launchShockwave() {
  const shocks = 3;
  for (let i = 0; i < shocks; i++) {
    setTimeout(() => {
      let r = 0;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.hypot(cx, cy) * 1.2;
      const id = setInterval(() => {
        r += 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,140,0,${Math.max(0, 0.6 - r / maxR)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (r > maxR) clearInterval(id);
      }, 16);
    }, i * 300);
  }
}
