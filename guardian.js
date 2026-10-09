/**
 * GUARDIAN.JS - Self-Contained Risk, Safety & Success Animation Engine
 * For DMA Trading Checklist
 */

(function() {
  'use strict';

  const MANTRAS = [
    {
      quote: "Protect your downside relentlessly. The upside takes care of itself.",
      author: "Paul Tudor Jones • Capital Preservation"
    },
    {
      quote: "Amateurs think about how much they can make. Professionals obsess over how much they can lose.",
      author: "Risk Protocol • Drawdown Guard"
    },
    {
      quote: "A trade taken without checklist confluences is gambling. Stick strictly to your gates.",
      author: "Checklist Discipline • 76.2% Edge"
    },
    {
      quote: "Patience is an edge. Sitting on your hands in cash is an active, profitable position.",
      author: "Execution Mastery • Zero FOMO"
    },
    {
      quote: "Your edge only exists in the presence of strict, non-negotiable risk rules.",
      author: "The Systematic Trader • DMA Shield"
    }
  ];

  let mantraIndex = 0;
  let hudTimer = null;

  // Synthesizes a futuristic, subtle harmonic acoustic chime (D5 587Hz -> A5 880Hz)
  function playGuardianChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Note 1: Safety Shield frequency (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: Success Harmonic (880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.55);
    } catch (e) {
      // Audio optional / browser muted
    }
  }

  // Spawns dual shockwave radar rings and radiant sparks
  function spawnSparksAndRings(el) {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Dual Shockwave rings
    const ring1 = document.createElement('div');
    ring1.className = 'shield-shockwave-ring';
    ring1.style.left = centerX + 'px';
    ring1.style.top = centerY + 'px';
    document.body.appendChild(ring1);
    setTimeout(() => ring1.remove(), 950);

    const ring2 = document.createElement('div');
    ring2.className = 'shield-shockwave-ring secondary';
    ring2.style.left = centerX + 'px';
    ring2.style.top = centerY + 'px';
    document.body.appendChild(ring2);
    setTimeout(() => ring2.remove(), 1100);

    // 16 Radiant Sparks (Emerald, Gold, Cyan)
    const colors = ['#10b981', '#fbbf24', '#06b6d4', '#34d399', '#f59e0b', '#38bdf8', '#10e396'];
    const count = 16;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'guardian-spark';
      const angle = (i / count) * (Math.PI * 2) + (Math.random() * 0.4 - 0.2);
      const dist = 40 + Math.random() * 55;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      spark.style.left = centerX + 'px';
      spark.style.top = centerY + 'px';
      spark.style.setProperty('--tx', tx + 'px');
      spark.style.setProperty('--ty', ty + 'px');
      spark.style.background = colors[i % colors.length];
      spark.style.boxShadow = '0 0 12px ' + colors[i % colors.length] + ', 0 0 20px ' + colors[i % colors.length];

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 850);
    }
  }

  // Ensures HUD exists in DOM and returns it
  function getOrCreateHUD() {
    let hud = document.getElementById('risk-guardian-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'risk-guardian-hud';
      hud.className = 'risk-guardian-hud';
      hud.setAttribute('role', 'dialog');
      hud.setAttribute('aria-label', 'Capital Shield & Risk Guardian');
      hud.innerHTML = `
        <div class="guardian-hud-header">
          <div class="guardian-title-group">
            <div class="guardian-shield-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div class="guardian-titles">
              <h4>CAPITAL SHIELD</h4>
              <span>RISK PROTOCOL ACTIVE</span>
            </div>
          </div>
          <div class="guardian-badge-status">
            <span class="guardian-dot-pulse"></span>
            ARMED
          </div>
        </div>

        <div class="guardian-pillars">
          <div class="guardian-pillar-card">
            <span class="pillar-tag">🛡️ SAFETY</span>
            <span class="pillar-val green">MAX 1%</span>
            <span class="pillar-sub">Preserve Capital</span>
          </div>
          <div class="guardian-pillar-card">
            <span class="pillar-tag">⚖️ RISK MGMT</span>
            <span class="pillar-val cyan">STRICT GATES</span>
            <span class="pillar-sub">Zero FOMO</span>
          </div>
          <div class="guardian-pillar-card">
            <span class="pillar-tag">📈 SUCCESS</span>
            <span class="pillar-val gold">+76.2% WR</span>
            <span class="pillar-sub">Rules = Profit</span>
          </div>
        </div>

        <div class="guardian-mantra-box">
          <p class="guardian-mantra-text" id="guardian-quote-text"></p>
          <span class="guardian-mantra-author" id="guardian-quote-author"></span>
        </div>

        <div class="guardian-progress-track">
          <div class="guardian-progress-fill" id="guardian-progress-bar"></div>
        </div>
      `;

      hud.addEventListener('click', () => {
        hud.classList.remove('active');
      });

      document.body.appendChild(hud);
    }
    return hud;
  }

  // Master Trigger Function
  window.triggerChecklistGuardianAnimation = function(targetEl) {
    if (!targetEl) {
      targetEl = document.getElementById('checklist-hero-logo') ||
                 document.querySelector('.app-header .app-logo') ||
                 document.querySelector('.app-logo') ||
                 document.querySelector('.logo');
    }
    if (!targetEl) return;

    // 1. Audio Harmonic Chime
    playGuardianChime();

    // 2. Logo Spring & Emerald Aura
    targetEl.classList.remove('shield-pulsing');
    void targetEl.offsetWidth; // force reflow
    targetEl.classList.add('shield-pulsing');

    // 3. Shockwave Radar Rings & Radiant Sparks
    spawnSparksAndRings(targetEl);

    // 4. Guardian HUD Capsule Dropdown
    const hud = getOrCreateHUD();
    const quoteText = document.getElementById('guardian-quote-text');
    const quoteAuthor = document.getElementById('guardian-quote-author');
    const progressBar = document.getElementById('guardian-progress-bar');

    const item = MANTRAS[mantraIndex % MANTRAS.length];
    mantraIndex++;

    if (quoteText) quoteText.textContent = '"' + item.quote + '"';
    if (quoteAuthor) quoteAuthor.textContent = item.author;

    if (progressBar) {
      progressBar.style.animation = 'none';
      void progressBar.offsetWidth;
      progressBar.style.animation = 'hudCountdown 4.5s linear forwards';
    }

    hud.classList.add('active');

    if (hudTimer) clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
      hud.classList.remove('active');
    }, 4500);
  };

  // Auto-bind to all potential checklist logos
  function bindLogos() {
    const selectors = [
      '#checklist-hero-logo',
      '.app-header .app-logo',
      '.navbar .logo',
      '.app-logo',
      '.mock-header',
      '.mock-check'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    elements.forEach(el => {
      el.style.cursor = 'pointer';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('title', 'Safety, Risk Management & Success Guardian');

      // Prevent duplicate listener
      if (el._guardianBound) return;
      el._guardianBound = true;

      el.addEventListener('click', function(e) {
        if (el.tagName === 'A') e.preventDefault();
        window.triggerChecklistGuardianAnimation(el);
      });

      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.triggerChecklistGuardianAnimation(el);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLogos);
  } else {
    bindLogos();
  }

  // Also run bindLogos after window load to catch late renders
  window.addEventListener('load', bindLogos);
})();
