/* deck.js — 상태·입력·전환 엔진 (Vanilla JS, ES2020) */
(() => {
  'use strict';
  const S = window.SLIDES, CH = window.CHAPTERS, FB = window.FALLBACK_BG || {};
  const DEBUG = !/[?&]debug=0/.test(location.search);
  const log = (...a) => DEBUG && console.log('[deck]', ...a);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const stage = $('#stage');
  const slides = $$('.slide', stage);
  const N = S.length;
  if (slides.length !== N) console.warn('[deck] slide count mismatch', slides.length, N);

  const state = { index: 0, step: 0, locked: false, overlay: 'none', paused: false };
  const idToIndex = Object.fromEntries(S.map((s, i) => [s.id, i]));

  /* ───────── Stage scaling ───────── */
  function fit() {
    const sc = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.setProperty('--scale', sc);
  }
  addEventListener('resize', fit); fit();

  /* ───────── Backgrounds ───────── */
  const CH_GRAD = [
    'radial-gradient(120% 80% at 70% 30%,#0b2a3a,#000 70%)',
    'radial-gradient(120% 80% at 30% 70%,#1b1a33,#000 70%)',
    'radial-gradient(120% 80% at 70% 30%,#0e1f3d,#000 70%)',
    'radial-gradient(120% 80% at 30% 40%,#231a3d,#000 70%)',
    'radial-gradient(120% 80% at 70% 60%,#3a2414,#000 70%)',
    'radial-gradient(120% 80% at 50% 30%,#102a2e,#000 70%)',
    'radial-gradient(120% 80% at 50% 70%,#0a2338,#000 70%)',
  ];
  function buildBg(i) {
    const m = S[i], sl = slides[i];
    sl.dataset.id = m.id; sl.id = 's-' + m.id;
    if (m.overlay) sl.dataset.overlay = m.overlay;
    const bg = document.createElement('div');
    bg.className = 'bg';
    bg.style.background = CH_GRAD[m.ch] || '#000';
    if (m.type === 'image') {
      const img = new Image(); img.src = `assets/img/${m.bg}.jpg`; img.alt = '';
      bg.classList.add('kenburns'); bg.appendChild(img);
    } else if (m.type === 'video') {
      const poster = new Image(); poster.className = 'poster'; poster.alt = '';
      poster.src = `assets/img/poster/${m.bg}.jpg`;
      poster.onerror = () => { poster.remove(); };
      bg.appendChild(poster);
      bg.dataset.src = `assets/video/${m.bg}.mp4`;
      bg.dataset.fallback = FB[m.id] ? `assets/video/${FB[m.id]}.mp4` : '';
    }
    const ov = document.createElement('div'); ov.className = 'bg-overlay';
    sl.prepend(ov);
    // 스텝별 배경(stepBg) — 기본 배경 위에 겹쳐 두고 해당 스텝에서 교차 전환
    Object.entries(m.stepBg || {}).sort((a, b) => b[0] - a[0]).forEach(([k, name]) => {
      const lay = document.createElement('div');
      lay.className = 'bg bg-step'; lay.dataset.k = k;
      const p = new Image(); p.className = 'poster'; p.alt = ''; p.src = `assets/img/poster/${name}.jpg`; p.onerror = () => p.remove();
      lay.appendChild(p); lay.dataset.src = `assets/video/${name}.mp4`; lay.dataset.fallback = '';
      sl.prepend(lay);
    });
    sl.prepend(bg);
  }
  S.forEach((_, i) => buildBg(i));

  function mountVideo(i) { $$('.bg', slides[i]).forEach(bg => mountLayer(i, bg)); }
  function mountLayer(i, bg) {
    if (!bg || !bg.dataset.src || $('video', bg)) return;
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('muted', '');
    let triedFallback = false;
    v.addEventListener('error', () => {
      if (!triedFallback && bg.dataset.fallback) {
        triedFallback = true; log('fallback video', S[i].id, bg.dataset.fallback);
        v.src = bg.dataset.fallback; v.load(); return;
      }
      console.warn('[deck] video failed', S[i].id, v.currentSrc || bg.dataset.src);
      bg.classList.add('kenburns'); v.remove();
    });
    v.addEventListener('canplay', () => { v.classList.add('is-ready'); }, { once: true });
    v.src = bg.dataset.src; bg.appendChild(v);
  }
  function unmountVideo(i) {
    $$('.bg video', slides[i]).forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); });
  }
  function syncMedia() {
    const keep = new Set([state.index - 1, state.index, state.index + 1].filter(k => k >= 0 && k < N));
    for (let i = 0; i < N; i++) { keep.has(i) ? mountVideo(i) : unmountVideo(i); }
    for (let i = 0; i < N; i++) {
      $$('.bg-step video', slides[i]).forEach(v => { if (i !== state.index) v.pause(); });
      const v = $('.bg:not(.bg-step) video', slides[i]); if (!v) continue;
      if (i === state.index) {
        if (!state.paused) { try { v.currentTime = 0; } catch (e) {} v.play().catch(() => {}); }
      } else { setTimeout(() => { if (i !== state.index) v.pause(); }, 500); }
    }
  }

  /* ───────── Steps ───────── */
  function applySteps(i, step, backward = false) {
    const sl = slides[i];
    $$('[data-step]', sl).forEach(el => {
      const n = +el.dataset.step;
      const on = step >= n;
      el.classList.toggle('is-off', backward && !on);
      el.classList.toggle('is-on', on);
    });
    $$('[data-dim-at]', sl).forEach(el => el.classList.toggle('dim', step >= +el.dataset.dimAt));
    $$('[data-soft-at]', sl).forEach(el => el.classList.toggle('dim-soft', step >= +el.dataset.softAt));
    $$('[data-gone-at]', sl).forEach(el => el.classList.toggle('gone', step >= +el.dataset.goneAt));
    $$('[data-cls-at]', sl).forEach(el => {
      const [at, cls] = el.dataset.clsAt.split(':'); el.classList.toggle(cls, step >= +at);
    });
    applyStepBg(i, step);
    const hook = window.HOOKS && window.HOOKS[S[i].id];
    if (hook && hook.onStep) hook.onStep(step, sl, backward);
  }
  function applyStepBg(i, step) {
    const layers = $$('.bg-step', slides[i]); if (!layers.length) return;
    const keys = layers.map(l => +l.dataset.k).filter(k => k <= step);
    const act = keys.length ? Math.max(...keys) : -1;
    layers.forEach(l => {
      const on = +l.dataset.k === act, was = l.classList.contains('on');
      l.classList.toggle('on', on);
      const v = $('video', l); if (!v) return;
      if (on && !was && i === state.index && !state.paused) { try { v.currentTime = 0; } catch (e) {} v.play().catch(() => {}); }
      if (!on) setTimeout(() => { if (!l.classList.contains('on')) v.pause(); }, 900);
    });
  }

  /* ───────── Chrome ───────── */
  const pageNo = $('.page-no .txt'), dots = $('.step-dots'), fill = $('.progress .fill'),
        ticks = $('.progress .ticks'), tip = $('.progress .tip'), chip = $('.chapter-chip'),
        brand = $('.brand'), jumpBox = $('.jump-input');
  S.forEach((m, i) => { if (m.chapterStart && i > 0) { const t = document.createElement('i'); t.style.left = (i / N * 100) + '%'; ticks.appendChild(t); } });
  function renderChrome() {
    const m = S[state.index];
    pageNo.textContent = `${m.id} / ${N}`;
    dots.innerHTML = Array.from({ length: m.steps }, (_, k) => `<i class="${state.step > k ? 'on' : ''}"></i>`).join('');
    fill.style.width = ((state.index + 1) / N * 100) + '%';
    const hook = window.HOOKS && window.HOOKS[m.id];
    const showBrand = (m.id === '00') || (hook && hook.brandAt != null && state.step >= hook.brandAt);
    brand.classList.toggle('show', !!showBrand);
  }
  let chipT;
  function showChip(text) {
    chip.textContent = text; chip.classList.add('show'); clearTimeout(chipT);
    chipT = setTimeout(() => chip.classList.remove('show'), 1500);
  }

  /* ───────── Auto-step (slides.js의 auto:ms) ───────── */
  let autoT = null;
  function cancelAuto() { if (autoT) { clearTimeout(autoT); autoT = null; } }
  function scheduleAuto() {
    cancelAuto();
    const m = S[state.index];
    if (!m.auto || state.step >= Math.min(m.steps, m.autoTo ?? m.steps)) return;
    autoT = setTimeout(() => {
      autoT = null;
      if (state.overlay !== 'none' || state.locked) { scheduleAuto(); return; }
      state.step++; applySteps(state.index, state.step); renderChrome(); log('auto step', state.step);
      scheduleAuto();
    }, m.auto);
  }

  /* ───────── Navigation core ───────── */
  function go(i, step, dir = 'forward') {
    i = Math.max(0, Math.min(N - 1, i));
    if (state.locked) return;
    cancelAuto();
    const from = state.index, same = (i === from);
    state.locked = true;
    const prevSl = from >= 0 ? slides[from] : null, nextSl = slides[i];
    const fwd = dir === 'forward', bwd = dir === 'backward';
    if (!same && prevSl) {
      prevSl.classList.add(fwd ? 'leave-fwd' : bwd ? 'leave-bwd' : 'leave-fade');
      nextSl.classList.add(fwd ? 'enter-fwd' : bwd ? 'enter-bwd' : 'enter-fade');
    }
    state.index = i; state.step = Math.max(0, Math.min(S[i].steps, step));
    location.hash = S[i].id;
    syncMedia();
    applySteps(i, state.step, false);
    renderChrome();
    if (S[i].chapterStart && !same && i > 0) { showChip(CH[S[i].ch]); nextSl.classList.add('chapter-zoom'); }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      nextSl.classList.add('is-active');
      nextSl.classList.remove('enter-fwd', 'enter-bwd', 'enter-fade');
      if (!same && prevSl) { prevSl.classList.remove('is-active'); }
    }));
    setTimeout(() => {
      if (!same && prevSl) prevSl.classList.remove('leave-fwd', 'leave-bwd', 'leave-fade', 'chapter-zoom');
      state.locked = false;
      log('at', S[i].id, 'step', state.step);
      const hook = window.HOOKS && window.HOOKS[S[i].id];
      if (hook && hook.onEnter && !same) hook.onEnter(nextSl, state.step);
      scheduleAuto();
    }, 650);
  }
  function next() {
    if (state.locked || state.overlay !== 'none') return;
    cancelAuto();
    const m = S[state.index];
    if (state.step < m.steps) { state.step++; applySteps(state.index, state.step); renderChrome(); log('step', state.step); scheduleAuto(); }
    else if (state.index < N - 1) go(state.index + 1, 0, 'forward');
  }
  function prev() {
    if (state.locked || state.overlay !== 'none') return;
    cancelAuto();
    if (state.step > 0) { state.step--; applySteps(state.index, state.step, true); renderChrome(); }
    else if (state.index > 0) go(state.index - 1, S[state.index - 1].steps, 'backward');
  }
  const jump = (i) => { if (i !== state.index || state.step) go(i, 0, 'fade'); };
  window.deck = { go, next, prev, jump, state, slides, idToIndex };

  /* ───────── Overlays ───────── */
  const toc = $('.overlay-toc'), help = $('.overlay-help'), black = $('.blackout');
  let tocFocus = 0;
  function buildToc() {
    const rows = $('.toc-rows', toc); rows.innerHTML = '';
    CH.forEach((name, c) => {
      const row = document.createElement('div'); row.className = 'toc-row';
      row.innerHTML = `<h3>${name}</h3><div class="thumbs"></div>`;
      const th = $('.thumbs', row);
      S.forEach((m, i) => {
        if (m.ch !== c) return;
        const d = document.createElement('div'); d.className = 'thumb'; d.dataset.i = i;
        const src = m.type === 'image' ? `assets/img/${m.bg}.jpg` : `assets/img/poster/${m.bg}.jpg`;
        d.innerHTML = `<img src="${src}" alt="" onerror="this.remove()"><span class="n">${m.id}</span><span class="t">${m.title}</span>`;
        d.style.background = CH_GRAD[c];
        d.addEventListener('click', () => { closeOverlay(); jump(i); });
        th.appendChild(d);
      });
      rows.appendChild(row);
    });
  }
  buildToc();
  function tocRender() {
    $$('.thumb', toc).forEach(t => { t.classList.toggle('current', +t.dataset.i === state.index); t.classList.toggle('focus', +t.dataset.i === tocFocus); });
  }
  function openOverlay(which) {
    closeOverlay(true);
    state.overlay = which;
    if (which === 'toc') { tocFocus = state.index; tocRender(); toc.classList.add('show'); }
    if (which === 'help') help.classList.add('show');
    if (which === 'black') black.classList.add('show');
  }
  function closeOverlay(silent) {
    toc.classList.remove('show'); help.classList.remove('show'); black.classList.remove('show');
    state.overlay = 'none';
  }
  function toggleOverlay(which) { state.overlay === which ? closeOverlay() : openOverlay(which); }
  function tocMove(dx, dy) {
    const cur = S[tocFocus];
    if (dx) { tocFocus = Math.max(0, Math.min(N - 1, tocFocus + dx)); }
    if (dy) {
      const ch = Math.max(0, Math.min(CH.length - 1, cur.ch + dy));
      const inCh = S.map((m, i) => m.ch === cur.ch ? i : -1).filter(i => i >= 0);
      const pos = inCh.indexOf(tocFocus);
      const target = S.map((m, i) => m.ch === ch ? i : -1).filter(i => i >= 0);
      tocFocus = target[Math.min(pos, target.length - 1)];
    }
    tocRender();
  }

  /* ───────── Fullscreen ───────── */
  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }

  /* ───────── Keyboard ───────── */
  let numBuf = '', numT;
  function showJump() { jumpBox.textContent = numBuf; jumpBox.classList.toggle('show', !!numBuf); }
  function commitJump() {
    const id = numBuf.replace('.', '-'); numBuf = ''; showJump();
    const norm = id.length === 1 ? '0' + id : id;
    const i = idToIndex[norm] ?? idToIndex[id];
    if (i != null) { closeOverlay(); jump(i); }
  }
  addEventListener('keydown', (e) => {
    const k = e.key;
    if (state.overlay === 'black') { e.preventDefault(); closeOverlay(); return; }
    if (state.overlay === 'toc') {
      if (k === 'ArrowRight') tocMove(1, 0); else if (k === 'ArrowLeft') tocMove(-1, 0);
      else if (k === 'ArrowDown') tocMove(0, 1); else if (k === 'ArrowUp') tocMove(0, -1);
      else if (k === 'Enter') { closeOverlay(); jump(tocFocus); }
      else if (k === 'Escape' || k.toLowerCase() === 'o') closeOverlay();
      e.preventDefault(); return;
    }
    if (state.overlay === 'help') { if (k === 'Escape' || k === '?' || k === '/') closeOverlay(); e.preventDefault(); return; }

    if (/^[0-9.]$/.test(k)) { numBuf += k; showJump(); clearTimeout(numT); numT = setTimeout(() => { numBuf = ''; showJump(); }, 2000); e.preventDefault(); return; }
    if (k === 'Enter' && numBuf) { clearTimeout(numT); commitJump(); e.preventDefault(); return; }
    if (k === 'Backspace' && numBuf) { numBuf = numBuf.slice(0, -1); showJump(); e.preventDefault(); return; }

    switch (k) {
      case 'ArrowDown': case 'ArrowRight': case ' ': case 'PageDown':
        e.preventDefault(); if (e.shiftKey && k !== ' ') { if (state.index < N - 1) go(state.index + 1, 0, 'forward'); } else next(); break;
      case 'ArrowUp': case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); if (e.shiftKey) { if (state.index > 0) go(state.index - 1, 0, 'backward'); } else prev(); break;
      case 'Home': e.preventDefault(); jump(0); break;
      case 'End': e.preventDefault(); jump(N - 1); break;
      case 'f': case 'F': toggleFs(); break;
      case 'F11': e.preventDefault(); toggleFs(); break;
      case 'o': case 'O': toggleOverlay('toc'); break;
      case '?': case '/': toggleOverlay('help'); break;
      case 'b': case 'B': toggleOverlay('black'); break;
      case 'r': case 'R': { const i = state.index; state.index = -1; go(i, 0, 'fade'); break; }
      case 'p': case 'P': { state.paused = !state.paused; const sl = slides[state.index]; const v = $('.bg-step.on video', sl) || $('.bg:not(.bg-step) video', sl); if (v) state.paused ? v.pause() : v.play().catch(() => {}); break; }
      case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
    }
  });

  /* ───────── Wheel: 1 gesture = 1 move ───────── */
  let wheelLock = false, lastWheel = 0;
  addEventListener('wheel', (e) => {
    e.preventDefault();
    if (state.overlay !== 'none') return;
    const now = performance.now();
    const cont = now - lastWheel < 120; lastWheel = now;
    if (wheelLock || cont) return;
    if (Math.abs(e.deltaY) < 4) return;
    wheelLock = true; setTimeout(() => { wheelLock = false; }, 650);
    e.deltaY > 0 ? next() : prev();
  }, { passive: false });

  /* ───────── Mouse ───────── */
  stage.addEventListener('click', (e) => {
    if (state.overlay === 'black') { closeOverlay(); return; }
    if (state.overlay !== 'none') return;
    if (e.target.closest('.is-link, .no-nav, .chrome, .overlay')) return;
    next();
  });
  addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.overlay === 'black') { closeOverlay(); return; }
    if (state.overlay !== 'none') return;
    if (e.target.closest('.chrome, .overlay, .no-nav')) return;
    prev();
  });
  $('.edge-arrow.left').addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  $('.edge-arrow.right').addEventListener('click', (e) => { e.stopPropagation(); next(); });
  const prog = $('.progress');
  prog.addEventListener('mousemove', (e) => {
    const r = prog.getBoundingClientRect(); const p = (e.clientX - r.left) / r.width;
    const i = Math.max(0, Math.min(N - 1, Math.floor(p * N)));
    tip.style.left = ((i + .5) / N * 100) + '%'; tip.textContent = `${S[i].id} · ${S[i].title}`;
  });
  prog.addEventListener('click', (e) => {
    e.stopPropagation(); const r = prog.getBoundingClientRect(); const p = (e.clientX - r.left) / r.width;
    jump(Math.max(0, Math.min(N - 1, Math.floor(p * N))));
  });

  // cursor auto-hide, edge arrows, progress expand
  let cursorT, mouseT;
  addEventListener('mousemove', (e) => {
    document.body.classList.remove('hide-cursor'); document.body.classList.add('mouse-active');
    clearTimeout(cursorT); clearTimeout(mouseT);
    cursorT = setTimeout(() => document.body.classList.add('hide-cursor'), 3000);
    mouseT = setTimeout(() => document.body.classList.remove('mouse-active'), 2500);
    const x = e.clientX, w = innerWidth;
    const sc = parseFloat(stage.style.getPropertyValue('--scale')) || 1;
    const left = (w - 1920 * sc) / 2;
    const rx = (x - left) / sc;
    $('.edge-arrow.left').classList.toggle('show', rx >= 0 && rx < 160 && state.overlay === 'none');
    $('.edge-arrow.right').classList.toggle('show', rx > 1760 && rx <= 1920 && state.overlay === 'none');
  });
  addEventListener('dblclick', e => e.preventDefault());
  addEventListener('selectstart', e => e.preventDefault());

  /* ───────── Links (05 BI → 06) ───────── */
  stage.addEventListener('click', (e) => {
    const a = e.target.closest('[data-goto]'); if (!a) return;
    e.stopPropagation();
    const target = idToIndex[a.dataset.goto]; if (target == null) return;
    if (a.dataset.flip) flipTo(a, target); else jump(target);
  });
  function flipTo(el, target) {
    // 공유 요소 전환: 현재 BI 카드 → 06 상단 칩 위치로 이동하는 고스트
    const dest = $(`[data-flip-target="${el.dataset.flip}"]`, slides[target]);
    if (!dest) return jump(target);
    const sc = parseFloat(stage.style.getPropertyValue('--scale')) || 1;
    const a = el.getBoundingClientRect(), stR = stage.getBoundingClientRect();
    const ghost = el.cloneNode(true); ghost.classList.add('flip-ghost');
    Object.assign(ghost.style, { position: 'absolute', left: ((a.left - stR.left) / sc) + 'px', top: ((a.top - stR.top) / sc) + 'px', width: (a.width / sc) + 'px', height: (a.height / sc) + 'px', zIndex: 6, margin: 0, transition: 'all .7s cubic-bezier(.2,.7,.2,1)', pointerEvents: 'none' });
    stage.appendChild(ghost);
    // 06을 먼저 활성화해서 목적지 좌표를 얻는다
    jump(target);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const b = dest.getBoundingClientRect();
      Object.assign(ghost.style, { left: ((b.left - stR.left) / sc) + 'px', top: ((b.top - stR.top) / sc) + 'px', width: (b.width / sc) + 'px', height: (b.height / sc) + 'px', opacity: .0 });
      setTimeout(() => ghost.remove(), 720);
    }));
  }

  /* ───────── Boot ───────── */
  const loader = $('.loader');
  function start() {
    const h = location.hash.replace('#', '');
    const i = idToIndex[h] ?? 0;
    state.index = -1;
    go(i, 0, 'fade');
    setTimeout(() => loader.classList.add('hide'), 100);
  }
  const ready = Promise.race([
    Promise.all([
      document.fonts.load('400 30px Freesentation'), document.fonts.load('500 24px Freesentation'),
      document.fonts.load('700 56px Freesentation'), document.fonts.load('800 76px Freesentation'),
    ]),
    new Promise(r => setTimeout(r, 1500)),
  ]);
  ready.then(start);
  addEventListener('hashchange', () => {
    const h = location.hash.replace('#', ''); const i = idToIndex[h];
    if (i != null && i !== state.index) jump(i);
  });
  // lazy-load remaining weights
  ['100 24px', '200 72px', '300 22px', '600 40px', '900 360px'].forEach(f => document.fonts.load(f + ' Freesentation').catch(() => {}));
})();
