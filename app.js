/* ============================================================
   HULK AVENGERS — app.js
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   1. SMASH INTRO
   ───────────────────────────────────────────────────────────── */
const overlay   = document.getElementById('smash-overlay');
const crackCvs  = document.getElementById('crack-canvas');
const smashText = document.getElementById('smash-text');
const shockwave = document.getElementById('shockwave');

let introFinished = false;

function runIntro() {
  const ctx = crackCvs.getContext('2d');

  function resizeCrack() {
    crackCvs.width  = window.innerWidth;
    crackCvs.height = window.innerHeight;
  }
  resizeCrack();
  window.addEventListener('resize', resizeCrack);

  // Phase 1: Hulk drops — green glow ramp
  setTimeout(() => {
    document.getElementById('hulk-sprite').style.animation = 'introFloat 2s ease-in-out infinite';
    document.getElementById('hulk-sprite').style.boxShadow = '0 0 120px #00ff41, 0 0 240px rgba(0,255,65,.6)';
  }, 300);

  // Phase 2: SMASH text appears
  setTimeout(() => {
    smashText.style.opacity = '1';
  }, 800);

  // Phase 3: CRACK the screen
  setTimeout(() => {
    drawCrack(ctx);
    triggerShockwave();
    shakeScreen();
  }, 1200);

  // Phase 4: Fade overlay
  setTimeout(() => {
    endIntro();
  }, 3200);
}

function drawCrack(ctx) {
  const W = crackCvs.width;
  const H = crackCvs.height;
  const cx = W / 2;
  const cy = H / 2;

  ctx.clearRect(0, 0, W, H);

  // Radial burst
  ctx.save();
  const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, 260);
  gradient.addColorStop(0,   'rgba(0,255,65,0.6)');
  gradient.addColorStop(0.4, 'rgba(0,255,65,0.15)');
  gradient.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw cracks
  const crackAngles = [0, 38, 72, 110, 145, 190, 230, 270, 315];
  crackAngles.forEach(angleDeg => {
    const angle = (angleDeg * Math.PI) / 180;
    const length = 180 + Math.random() * 200;
    drawSingleCrack(ctx, cx, cy, angle, length);
  });

  // Inner ring cracks
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const len   = 50 + Math.random() * 80;
    drawSingleCrack(ctx, cx, cy, angle, len, 1.5);
  }
}

function drawSingleCrack(ctx, sx, sy, angle, length, width = 2.5) {
  let x = sx, y = sy;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth   = width;
  ctx.shadowColor = '#00ff41';
  ctx.shadowBlur  = 12;

  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const spread = (Math.random() - 0.5) * 0.6;
    const step   = (length / steps) * (0.6 + Math.random() * 0.8);
    x += Math.cos(angle + spread) * step;
    y += Math.sin(angle + spread) * step;
    ctx.lineTo(x, y);

    // branch crack
    if (i === Math.floor(steps * 0.5) && Math.random() > 0.4) {
      const branchAngle = angle + (Math.random() > 0.5 ? 0.5 : -0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth   = width * 0.5;
      ctx.strokeStyle = 'rgba(0,255,65,0.7)';
      let bx = x, by = y;
      for (let j = 0; j < 5; j++) {
        bx += Math.cos(branchAngle) * (step * 0.4);
        by += Math.sin(branchAngle) * (step * 0.4);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth   = width;
      ctx.strokeStyle = '#00ff41';
    }
  }
  ctx.stroke();
}

function triggerShockwave() {
  shockwave.style.opacity = '1';
  shockwave.style.animation = 'shockExpand 1.2s ease-out forwards';
  const keyframes = `
    @keyframes shockExpand {
      0%   { transform: translateX(-50%) scale(1);   opacity: 1; }
      100% { transform: translateX(-50%) scale(60);  opacity: 0; }
    }
  `;
  injectStyle(keyframes);
}

function shakeScreen() {
  document.body.style.animation = 'screenShake 0.5s ease-in-out';
  const keyframes = `
    @keyframes screenShake {
      0%,100% { transform: translate(0,0); }
      20%     { transform: translate(-8px, 6px); }
      40%     { transform: translate(8px, -6px); }
      60%     { transform: translate(-6px, 4px); }
      80%     { transform: translate(6px, -4px); }
    }
  `;
  injectStyle(keyframes);
  setTimeout(() => { document.body.style.animation = ''; }, 550);
}

function injectStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

function endIntro() {
  if (introFinished) return;
  introFinished = true;
  overlay.classList.add('hide');
  setTimeout(() => { overlay.style.display = 'none'; }, 700);

  // Start rage bar fill-up
  setTimeout(() => {
    document.getElementById('rage-fill').style.width = '78%';
  }, 500);
  // Start stat counters
  startCounters();
  // Start power bar anim
  triggerPowerBarsOnView();
}

function skipIntro() {
  endIntro();
}

/* ─────────────────────────────────────────────────────────────
   2. ANIMATED GAMMA PARTICLE BACKGROUND
   ───────────────────────────────────────────────────────────── */
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx    = bgCanvas.getContext('2d');
let   particles = [];
let   mouseX = 0, mouseY = 0;

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x     = Math.random() * bgCanvas.width;
    this.y     = Math.random() * bgCanvas.height;
    this.size  = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color   = Math.random() > 0.8 ? '#7dff4f' : '#00ff41';
    this.glow    = Math.random() > 0.9;
    this.life    = 0;
    this.maxLife = 400 + Math.random() * 400;
  }

  update() {
    this.x    += this.speedX;
    this.y    += this.speedY;
    this.life += 1;

    // Mouse repulsion
    const dx   = this.x - mouseX;
    const dy   = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      this.x += (dx / dist) * 1.8;
      this.y += (dy / dist) * 1.8;
    }

    if (this.life > this.maxLife || this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) {
      this.reset();
    }
  }

  draw() {
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.fillStyle = this.color;
    bgCtx.globalAlpha = this.opacity;
    if (this.glow) {
      bgCtx.shadowColor = this.color;
      bgCtx.shadowBlur  = 16;
    }
    bgCtx.fill();
    bgCtx.shadowBlur  = 0;
    bgCtx.globalAlpha = 1;
  }
}

// Hexagon grid lines in bg
function drawHexGrid() {
  const size = 80;
  const w    = size * 2;
  const h    = Math.sqrt(3) * size;
  bgCtx.strokeStyle = 'rgba(0,255,65,0.04)';
  bgCtx.lineWidth   = 1;
  for (let row = -1; row < bgCanvas.height / h + 2; row++) {
    for (let col = -1; col < bgCanvas.width / w + 2; col++) {
      const xOff = col % 2 === 0 ? 0 : w / 2;
      const cx   = col * w * 0.75;
      const cy   = row * h + xOff;
      drawHex(cx, cy, size - 4);
    }
  }
}

function drawHex(cx, cy, r) {
  bgCtx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = cx + r * Math.cos(angle);
    const hy = cy + r * Math.sin(angle);
    i === 0 ? bgCtx.moveTo(hx, hy) : bgCtx.lineTo(hx, hy);
  }
  bgCtx.closePath();
  bgCtx.stroke();
}

// Energy tendrils
const tendrils = Array.from({ length: 6 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  angle: Math.random() * Math.PI * 2,
  length: 120 + Math.random() * 180,
  speed: 0.004 + Math.random() * 0.004,
  opacity: 0.05 + Math.random() * 0.07,
  color: Math.random() > 0.5 ? '#00ff41' : '#39d353',
}));

function drawTendrils() {
  tendrils.forEach(t => {
    t.angle += t.speed;
    bgCtx.beginPath();
    bgCtx.moveTo(t.x, t.y);
    bgCtx.quadraticCurveTo(
      t.x + Math.cos(t.angle) * t.length * 0.6,
      t.y + Math.sin(t.angle) * t.length * 0.6,
      t.x + Math.cos(t.angle + 0.5) * t.length,
      t.y + Math.sin(t.angle + 0.5) * t.length,
    );
    bgCtx.strokeStyle = t.color;
    bgCtx.lineWidth   = 1.5;
    bgCtx.globalAlpha = t.opacity;
    bgCtx.stroke();
    bgCtx.globalAlpha = 1;
  });
}

for (let i = 0; i < 180; i++) particles.push(new Particle());

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  drawHexGrid();
  drawTendrils();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateBg);
}
animateBg();

/* ─────────────────────────────────────────────────────────────
   3. COUNTER ANIMATION
   ───────────────────────────────────────────────────────────── */
function startCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target  = parseInt(el.dataset.target, 10);
    const dur     = 1600;
    const step    = dur / 60;
    let   current = 0;
    const inc     = target / (dur / step);
    const timer   = setInterval(() => {
      current += inc;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, step);
  });
}

/* ─────────────────────────────────────────────────────────────
   4. INTERSECTION OBSERVER (powers, general sections)
   ───────────────────────────────────────────────────────────── */
function triggerPowerBarsOnView() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      const fill = entry.target.querySelector('.power-fill');
      if (fill) {
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 100);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.power-item').forEach(el => observer.observe(el));
}

// Scroll-triggered reveals for about / battle / dash cards
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.about-card, .battle-card, .dash-card').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(30px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  revealObs.observe(el);
});

/* ─────────────────────────────────────────────────────────────
   5. ABOUT CARD — REVEAL BUTTONS
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll('.reveal-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card   = e.target.closest('.about-card');
    const expId  = card.dataset.expand;
    const detail = document.getElementById(expId);
    const isOpen = detail.classList.contains('open');

    // Close all
    document.querySelectorAll('.expandable').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.reveal-btn').forEach(b => b.textContent = 'READ MORE');

    if (!isOpen) {
      detail.classList.add('open');
      btn.textContent = 'SHOW LESS';
    }
  });
});

/* ─────────────────────────────────────────────────────────────
   6. BATTLE MODAL
   ───────────────────────────────────────────────────────────── */
const battleData = {
  b1: {
    title: 'HULK vs THOR',
    body: [
      'In the halls of the Marvel universe, few battles have repeated as often as Hulk vs Thor. Both gods of destruction, their clashes have leveled city blocks.',
      'Thor\'s Mjolnir is one of the few weapons that can genuinely hurt Hulk — and Hulk is one of the few beings who can withstand thunder god-level hits without flinching.',
      'The outcome shifts based on Hulk\'s rage level. A calm Hulk can be overpowered by Thor. A World-Breaker Hulk is virtually impossible to contain.'
    ],
    verdict: 'VERDICT: Hulk Wins 8 of 14'
  },
  b2: {
    title: 'HULK vs THANOS',
    body: [
      'In Avengers: Infinity War, Hulk charged Thanos bare-handed — no Infinity Stones. The result was a stunning defeat that left Bruce Banner afraid to transform.',
      'Thanos had trained for 800 years and was in peak physical condition. Hulk was essentially fighting on instinct.',
      'In the comics, World Breaker Hulk has brought Thanos to his knees. The movie version reflected a Thanos pre-Stones who was already superhuman.'
    ],
    verdict: 'VERDICT: Disputed (Movie vs Comics)'
  },
  b3: {
    title: 'HULK vs ABOMINATION',
    body: [
      'Emil Blonsky, injected with enhanced Super Soldier serum and gamma radiation, became the Abomination — physically even stronger than the Hulk at rest.',
      'His bones are on the outside of his skin, making him seemingly impervious to damage. He does not revert like Hulk, making him a permanent monster.',
      'Hulk\'s key advantage: his strength increases with rage. Abomination\'s is fixed. In prolonged battles, Hulk inevitably outclasses him.'
    ],
    verdict: 'VERDICT: Hulk Wins (by rage escalation)'
  },
  b4: {
    title: 'HULK vs IRON MAN (Hulkbuster)',
    body: [
      'In Avengers: Age of Ultron, Tony Stark deployed the Hulkbuster (Veronica) armor — a 14-foot specialized suit designed specifically to contain an out-of-control Hulk.',
      'The fight demolished a city center. Stark\'s suit was breached, ripped apart, and required continuous repair from a satellite.',
      'Ultimately Stark managed to sedate Hulk — but by then billions in damage was done. One-on-one without prep, Hulk wins. With Hulkbuster: split decision.'
    ],
    verdict: 'VERDICT: Split — Prep Time Decides'
  }
};

const modal    = document.getElementById('battle-modal');
const modalCnt = document.getElementById('modal-content');

function openBattle(id) {
  const data = battleData[id];
  modalCnt.innerHTML = `
    <h2>${data.title}</h2>
    ${data.body.map(p => `<p>${p}</p>`).join('')}
    <div class="modal-verdict">${data.verdict}</div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBattle(e) {
  if (e && e.target !== modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────────
   7. DASHBOARD TOGGLE
   ───────────────────────────────────────────────────────────── */
function toggleDash(card) {
  const isActive = card.classList.contains('active');
  document.querySelectorAll('.dash-card').forEach(c => c.classList.remove('active'));
  if (!isActive) card.classList.add('active');
}

/* ─────────────────────────────────────────────────────────────
   8. NAVBAR SCROLL EFFECT
   ───────────────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav       = document.getElementById('navbar');
  const scrollPct = Math.min(window.scrollY / 600, 1);
  nav.style.background = `rgba(4, 13, 4, ${0.7 + scrollPct * 0.25})`;

  // Rage bar pulses while scrolling
  const rFill = document.getElementById('rage-fill');
  const base  = 78;
  const surge = Math.sin(Date.now() / 300) * 5;
  rFill.style.width = (base + scrollPct * 15 + surge) + '%';
});

// Rage bar live pulse
setInterval(() => {
  if (introFinished) {
    const rFill  = document.getElementById('rage-fill');
    const current = parseFloat(rFill.style.width) || 78;
    const surge   = Math.sin(Date.now() / 600) * 3;
    rFill.style.width = (current + surge) + '%';
  }
}, 100);

/* ─────────────────────────────────────────────────────────────
   9. GROUND CRACK BREATHING ANIMATION
   ───────────────────────────────────────────────────────────── */
const groundCrack = document.getElementById('ground-crack');
let crackT = 0;
function animateCrack() {
  crackT += 0.04;
  const glow = 10 + Math.sin(crackT) * 8;
  if (groundCrack) {
    groundCrack.style.filter = `drop-shadow(0 0 ${glow}px #00ff41)`;
  }
  requestAnimationFrame(animateCrack);
}
animateCrack();

/* ─────────────────────────────────────────────────────────────
   10. KICK OFF
   ───────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  runIntro();
});
