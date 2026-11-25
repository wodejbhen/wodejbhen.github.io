(() => {
  'use strict';
  if (document.getElementById('swarm-rebuild-layer')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const host = document.createElement('div');
  host.id = 'swarm-rebuild-layer';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  const colors = ['#527cf0', '#14aa94', '#ab77df', '#df9b53'];
  const launches = [[-94, -47], [72, -62], [90, 42], [-68, 54]];
  const tasks = [[-51, -20], [48, -18], [14, 27], [36, -11]];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const workers = [];
  let workersReady = false;
  let workerSetupPending = false;
  let mark = null;
  let markText = null;
  let hideTimer = 0;

  const stats = window.__swarmClickStats = {
    version: 'colab-click-optimized-1',
    clicks: 0,
    cursorCount: 4,
    active: false,
    lastTarget: null,
    continuousRafLoops: 0
  };

  function node(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    if (parent) parent.appendChild(el);
    return el;
  }

  colors.forEach((color, i) => {
    const cursor = document.createElement('span');
    cursor.className = 'swarm-cooperator';
    cursor.style.setProperty('--worker', color);
    cursor.style.setProperty('--swarm-delay', `${i * 32}ms`);
    const svg = node('svg', { viewBox: '0 0 18 20', 'aria-hidden': 'true' }, cursor);
    node('path', { d: 'M2.4 1.8 3.2 16.9 7.1 12.9 10.2 18.1 13.1 16.4 10.1 11.1 15.8 10.1Z' }, svg);
    const id = document.createElement('span');
    id.className = 'swarm-worker-id';
    id.textContent = `0${i + 1}`;
    cursor.appendChild(id);
    host.appendChild(cursor);
    workers.push(cursor);
  });

  function caption(target) {
    if (!(target instanceof Element)) return 'ALIGN';
    const el = target.closest('a,button,h1,h2,h3,h4,p,li');
    if (!el) return 'ALIGN';
    const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
    return Array.from(text || 'ALIGN').slice(0, 16).join('');
  }

  function createMark() {
    mark = document.createElement('div');
    mark.className = 'swarm-local-mark';
    const svg = node('svg', { class: 'swarm-local-geometry', viewBox: '-92 -58 184 116', 'aria-hidden': 'true' }, mark);
    node('line', { x1: -84, y1: 0, x2: 84, y2: 0, class: 'swarm-guide' }, svg);
    node('line', { x1: 0, y1: -52, x2: 0, y2: 52, class: 'swarm-guide' }, svg);
    for (let x = -72; x <= 72; x += 12) node('line', { x1: x, y1: -2, x2: x, y2: 2, class: 'swarm-tick' }, svg);
    for (let y = -48; y <= 48; y += 12) node('line', { x1: -2, y1: y, x2: 2, y2: y, class: 'swarm-tick' }, svg);
    node('line', { x1: -6, y1: 0, x2: 6, y2: 0, class: 'swarm-cross' }, svg);
    node('line', { x1: 0, y1: -6, x2: 0, y2: 6, class: 'swarm-cross' }, svg);
    node('rect', { x: -56, y: -22, width: 112, height: 44, rx: 1, pathLength: 100, class: 'swarm-frame' }, svg);
    node('rect', { x: -28, y: -12, width: 56, height: 24, rx: 1, pathLength: 100, class: 'swarm-frame swarm-frame-two' }, svg);
    markText = document.createElement('span');
    markText.className = 'swarm-typed';
    mark.appendChild(markText);
    host.appendChild(mark);
  }

  function draw(x, y, target) {
    if (!mark) createMark();
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;
    mark.style.setProperty('--ink', colors[(stats.clicks - 1) % colors.length]);
    mark.style.setProperty('--second', '#75d7dd');
    markText.textContent = caption(target);
    markText.style.setProperty('--steps', String(Math.max(1, Array.from(markText.textContent).length)));
    markText.classList.toggle('swarm-type-left', x > innerWidth - 150);
    markText.classList.toggle('swarm-type-above', y > innerHeight - 62);
    mark.classList.add('is-visible');
  }

  function translate(x, y) {
    return `translate3d(${x}px,${y}px,0)`;
  }

  function moveWorkers(x, y) {
    if (reduced.matches) {
      workersReady = true;
      workers.forEach((cursor, i) => {
        cursor.style.transform = translate(x + tasks[i][0], y + tasks[i][1]);
        cursor.style.opacity = '.94';
      });
      return;
    }

    if (!workersReady) {
      workers.forEach((cursor, i) => {
        cursor.style.transition = 'none';
        cursor.style.transform = translate(x + launches[i][0], y + launches[i][1]);
        cursor.style.opacity = '.94';
      });
      if (!workerSetupPending) {
        workerSetupPending = true;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          workerSetupPending = false;
          workersReady = true;
          workers.forEach(cursor => { cursor.style.transition = ''; });
          const target = stats.lastTarget;
          if (target) moveWorkers(target.x, target.y);
        }));
      }
      return;
    }

    workers.forEach((cursor, i) => {
      cursor.style.transform = translate(x + tasks[i][0], y + tasks[i][1]);
      cursor.style.opacity = '.94';
    });
  }

  function hide() {
    workers.forEach(cursor => { cursor.style.opacity = '0'; });
    if (mark) mark.classList.remove('is-visible');
    stats.active = false;
  }

  function hit(event) {
    if (!event.isPrimary || event.button !== 0 || document.hidden) return;
    const x = Math.round(event.clientX);
    const y = Math.round(event.clientY);
    stats.clicks += 1;
    stats.active = true;
    stats.lastTarget = { x, y, input: event.pointerType === 'touch' ? 'tap' : 'click' };
    clearTimeout(hideTimer);
    moveWorkers(x, y);
    draw(x, y, event.target);
    hideTimer = setTimeout(hide, reduced.matches ? 800 : 1620);
  }

  document.addEventListener('pointerdown', hit, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(hideTimer);
      hide();
    }
  });
})();
