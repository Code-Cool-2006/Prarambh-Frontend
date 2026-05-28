/* ============================================================
   PRARAMBH COUNTDOWN — script.js
   Target: 29 May 2026, 9:15 AM IST
   ============================================================ */

/* ── Countdown ── */
const TARGET = new Date('2026-05-29T09:15:00+05:30').getTime();

const elDays  = document.getElementById('days');
const elHours = document.getElementById('hours');
const elMins  = document.getElementById('minutes');
const elSecs  = document.getElementById('seconds');
const elCountdown = document.getElementById('countdown');
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
    elCountdown.style.display = 'none';
    elShowtime.classList.add('visible');
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

/* ── Rotating suspense lines ── */
const LINES = [
  "Are you ready for what comes next?",
  "Three rounds. Zero hints. Total chaos.",
  "Think you know what's coming? You don't.",
  "Every answer leads to a new question.",
  "Some games are played with your mind.",
  "Your instincts will be tested.",
  "Nothing is what it seems.",
  "The beginning is only the beginning.",
  "Decode. Hunt. Bid. Survive.",
  "What happens when you least expect it?",
];

let lineIdx = 0;
const lineEl = document.getElementById('curious-line');

setInterval(() => {
  lineEl.classList.add('fade-out');
  setTimeout(() => {
    lineIdx = (lineIdx + 1) % LINES.length;
    lineEl.textContent = LINES[lineIdx];
    lineEl.classList.remove('fade-out');
  }, 500);
}, 3200);
