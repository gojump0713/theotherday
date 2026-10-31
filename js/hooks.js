/* hooks.js — 슬라이드별 특수 동작 (카운트업, 연결선, 문턱 라인, 브랜드 표시 등) */
window.HOOKS = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  function countUp(el, to, dur = 1400, dec = 1, suffix = '') {
    const t0 = performance.now();
    const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('ko-KR');
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(to * easeOutExpo(p)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function donut(sl) {
    const C = 2 * Math.PI * 182; // r=182
    let acc = 0;
    $$('.donut .seg', sl).forEach(seg => {
      const pct = parseFloat(seg.dataset.pct);
      seg.style.strokeDashoffset = -(acc / 100 * C);
      seg.style.strokeDasharray = `${pct / 100 * C} ${C}`;
      acc += pct;
    });
  }

  return {
    '01': {
      onEnter(sl) {
        countUp($('.count-main', sl), 83.2, 1400, 1);
        $$('.count-won', sl).forEach(el => countUp(el, +el.dataset.v, 1200, 0, '원'));
        requestAnimationFrame(() => donut(sl));
        $$('.table tr', sl).forEach((tr, i) => { tr.style.transition = 'opacity .4s'; tr.style.transitionDelay = (i * 60) + 'ms'; tr.style.opacity = 1; });
      },
    },
    '04': {
      onStep(step, sl) {
        const cs = $$('.connect', sl);
        cs.forEach((c, i) => { c.style.transitionDelay = step >= 1 ? (i * 300) + 'ms' : '0ms'; c.classList.toggle('on', step >= 1); });
      },
    },
    '07': {
      onStep(step, sl) { $('.threshold', sl).classList.toggle('down', step >= 1); },
    },
    '19': {
      onEnter(sl) {
        const ba = $('.ba', sl); if (!ba) return;
        const setX = v => { v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--x', v + '%'); ba.setAttribute('aria-valuenow', Math.round(v)); return v; };
        setX(0);
        const run = ba._run = (performance.now() + 400);
        const ease = t => 1 - Math.pow(1 - t, 3);
        (function tick(now) {
          if (ba._run !== run) return;
          const t = now - run;
          if (t < 0) { requestAnimationFrame(tick); return; }
          if (t <= 1700) setX(ease(t / 1700) * 100);
          else if (t <= 2500) setX(100 - ease((t - 1700) / 800) * 50);
          else { setX(50); return; }
          requestAnimationFrame(tick);
        })(performance.now());
        if (ba.dataset.bound) return; ba.dataset.bound = '1';
        let drag = false;
        const px = e => { const r = ba.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
        ba.addEventListener('pointerdown', e => { drag = true; ba._run = null; ba.setPointerCapture(e.pointerId); setX(px(e)); });
        ba.addEventListener('pointermove', e => { if (drag) setX(px(e)); });
        ['pointerup', 'pointercancel'].forEach(ev => ba.addEventListener(ev, () => { drag = false; }));
      },
    },
    '29': {
      onEnter(sl) { countUp($('.count-main', sl), 83.2, 1400, 1); },
      onStep(step, sl) { $('.hero-num', sl).style.color = step >= 1 ? 'var(--kstory)' : 'var(--accent)'; },
    },
    '30': { brandAt: 2 },
  };
})();
