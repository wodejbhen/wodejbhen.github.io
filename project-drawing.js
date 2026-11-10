(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const projectRows = [...document.querySelectorAll('#projects .project-wrapper > .row')];
  const skillCards = [...document.querySelectorAll('#skills .skill-card')];
  if (projectRows.length < 5 || !skillCards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const eagerDrawings = new URLSearchParams(location.search).get('drawings') === 'all';
  const cardLabels = { media: '图片 / 视频卡', skill: '技能卡', stat: '数据结果卡' };
  const END_TIME = 9.4;

  const SHEETS = [
    {
      id: 'MEDIA-001', kind: 'media', title: 'MEDIA FRAME · IMAGE / VIDEO',
      category: 'SHARED THUMBNAIL · IMAGE SLOT / VIDEO SLOT',
      source: 'THREE PROJECT ROWS · ONE SHARED COMPONENT',
      desktop: { width: 865, height: 541.375 }, mobile: { width: 375, height: 235.125 },
      border: 1, radius: 3.75, pad: 0, gap: '[TBD]', inner: 0,
      shadow: { y: 14, blur: 34, spread: 0 },
      heights: [
        { code: 'H1', label: 'image-a-height', desktop: 541.375, mobile: 235.125 },
        { code: 'H2', label: 'image-b-height', desktop: 357.98, mobile: 155.86 },
        { code: 'H3', label: 'video-height', desktop: 487.44, mobile: 211.81 }
      ],
      layers: ['REFERENCE PLANE', 'SHARED FRAME / B · R1', 'IMAGE SLOT · SOURCE-ASPECT', 'VIDEO SLOT · 16:9', 'NATIVE CONTROL STRIP'],
      notes: [
        'Three project rows share the same thumbnail frame; two use images and one uses video.',
        'Source aspect ratios vary. Image/video content is omitted; media slot fills the frame.'
      ],
      facts: ['IMAGE SOURCES · 1280 × 800 / 1280 × 528 PX', 'VIDEO SOURCE · 1280 × 720 PX · 30 FPS · 125.015 S']
    },
    {
      id: 'SKILL-001', kind: 'skill', title: 'SKILL CARD · INDEX / TITLE / BODY',
      category: 'SHARED SKILL-CARD COMPONENT · FOUR INSTANCES',
      source: 'LIVE CSS · FOUR MATCHING SKILL CARDS',
      desktop: { width: 645, height: 156.77 }, mobile: { width: 375, height: 183.95 },
      border: 1, radius: 18, pad: 32, gap: 10, inner: 0,
      shadow: { y: 4, blur: 18, spread: 0 },
      heights: [
        { code: 'H1', label: 'skill-card-01', desktop: 156.77, mobile: 183.95 },
        { code: 'H2', label: 'skill-card-02', desktop: 156.77, mobile: 156.77 },
        { code: 'H3', label: 'skill-card-03', desktop: 129.58, mobile: 156.77 },
        { code: 'H4', label: 'skill-card-04', desktop: 129.58, mobile: 156.77 }
      ],
      layers: ['REFERENCE PLANE', 'CARD SHELL / B · R1', 'INDEX SLOT · TOP-RIGHT', 'TITLE SLOT · HUG', 'BODY SLOT · FLEX / WRAPS'],
      notes: [
        'Each skill card contains an index, heading and paragraph; copy is represented by slots.',
        'Four instances share the same component. Measured heights vary with the body copy.'
      ],
      facts: ['INDEX · 13 PX', 'TITLE · 22 PX · BODY · 17 PX']
    },
    {
      id: 'STAT-001', kind: 'stat', title: 'STAT CARD · VALUE / LABEL',
      category: 'SHARED RESULT TILE · TWO PROJECT INSTANCES',
      source: 'LIVE CSS · CAMPUS / BUSINESS RESULT TILES',
      desktop: { width: 865, height: 360 }, mobile: { width: 375, height: 240 },
      border: 1, radius: 3.75, pad: 0, gap: 10, inner: 0,
      shadow: { y: 14, blur: 34, spread: 0 },
      heights: [{ code: 'H', label: 'stat-card-height', desktop: 360, mobile: 240 }],
      layers: ['REFERENCE PLANE', 'STAT CARD SHELL / B · R1', 'VALUE SLOT · HUG', 'LABEL SLOT · FLEX', 'SLOT GAP · S2'],
      notes: [
        'The campus result and restaurant-analysis tiles share one stat-card structure.',
        'The actual metric and label stay in the page; the drawing uses architecture slots.'
      ],
      facts: ['VALUE SLOT · 80 PX', 'LABEL SLOT · 19 PX']
    }
  ];

  const stats = window.__projectDrawingStats = {
    cards: 3,
    mediaComponentInstances: document.querySelectorAll('#projects .project-wrapper__image .thumbnail:not(.thumbnail--stat)').length,
    skillCardInstances: skillCards.length,
    statCardInstances: document.querySelectorAll('#projects .thumbnail--stat').length,
    sheets: SHEETS.length,
    built: 0,
    opened: 0,
    animationRuns: 0,
    reducedMotion: reduceMotion.matches
  };

  const clamp01 = n => Math.max(0, Math.min(1, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function insertSheet(anchor, sheet, index) {
    const drawingId = `pbd-${sheet.id.toLowerCase()}`;
    const details = document.createElement('details');
    details.className = 'pbd-disclosure';
    details.dataset.drawingId = sheet.id;
    details.dataset.cardType = sheet.kind;
    details.innerHTML = `
      <summary aria-label="${cardLabels[sheet.kind]}的附加结构图">
        <span class="pbd-summary-mark" aria-hidden="true"></span>
        <span class="pbd-summary-copy">
          <span class="pbd-summary-kicker">附加结构图 · ${cardLabels[sheet.kind]} · 原内容保留</span>
          <span class="pbd-summary-title">${sheet.title}</span>
        </span>
        <span class="pbd-summary-action"><span class="pbd-open-label">展开图纸</span><span class="pbd-close-label">收起图纸</span><span class="pbd-chevron" aria-hidden="true"></span></span>
      </summary>
      <div class="pbd-sheet-scroll" tabindex="0" aria-label="Scrollable ${sheet.title} drawing sheet">
        <div class="pbd-scroll-hint" aria-hidden="true">SWIPE TO INSPECT THE FULL SHEET ↔</div>
        <div class="pbd-sheet-canvas"></div>
      </div>`;
    anchor.after(details);

    const canvas = details.querySelector('.pbd-sheet-canvas');
    const state = { sheet, details, canvas, svg: null, camera: null, registry: [], layers: [], timeline: null, built: false, frame: 0 };

    function group(start, stagger = 0, duration = .5) { state.timeline = { start, stagger, duration, index: 0 }; }
    function svgNode(tag, attrs = {}, parent = state.camera, animated = true) {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([key, value]) => { if (value != null) el.setAttribute(key, String(value)); });
      if (parent) parent.appendChild(el);
      if (animated && state.timeline) {
        const cls = ` ${el.getAttribute('class') || ''} `;
        const fill = el.getAttribute('fill') || '';
        const isFade = tag === 'text' || / (slot|ph|cl|env|hatch|ghost|leader-dash) /.test(cls) || fill.startsWith('url(');
        const item = { el, kind: isFade ? 'fade' : 'draw', start: state.timeline.start + state.timeline.index * state.timeline.stagger, duration: state.timeline.duration };
        state.timeline.index += 1;
        state.registry.push(item);
        el.style.opacity = '0';
        if (!isFade) {
          el.setAttribute('pathLength', '1');
          el.style.strokeDasharray = '1 2';
          el.style.strokeDashoffset = '1';
          if (fill && fill !== 'none') el.style.fillOpacity = '0';
        }
      }
      return el;
    }
    function text(x, y, value, cls = 'dt', attrs = {}, parent = state.camera) {
      const el = svgNode('text', { x, y, class: cls, ...attrs }, parent);
      el.textContent = value;
      return el;
    }
    function rect(x, y, w, h, r = 0, cls = 'obj', parent = state.camera, attrs = {}) {
      return svgNode('rect', { x, y, width: w, height: h, rx: r, class: cls, ...attrs }, parent);
    }
    function line(x1, y1, x2, y2, cls = 'thin', parent = state.camera, attrs = {}) {
      return svgNode('line', { x1, y1, x2, y2, class: cls, ...attrs }, parent);
    }
    function circle(cx, cy, r, cls = 'dot', parent = state.camera, attrs = {}) {
      return svgNode('circle', { cx, cy, r, class: cls, ...attrs }, parent);
    }
    function path(d, cls = 'thin', parent = state.camera) { return svgNode('path', { d, class: cls }, parent); }
    function polyline(points, cls = 'lead', parent = state.camera) { return svgNode('polyline', { points, class: cls }, parent); }

    function dimH(x1, x2, y, edgeY, label) {
      const sign = Math.sign(y - edgeY) || 1;
      line(x1, edgeY + sign * 3, x1, y + sign * 5, 'ext');
      line(x2, edgeY + sign * 3, x2, y + sign * 5, 'ext');
      line(x1, y, x2, y, 'dl', state.camera, { 'marker-start': `url(#${drawingId}-arrow)`, 'marker-end': `url(#${drawingId}-arrow)` });
      text((x1 + x2) / 2, y - 5, label, 'dt', { 'text-anchor': 'middle' });
    }
    function dimV(y1, y2, x, edgeX, label) {
      const sign = Math.sign(x - edgeX) || 1;
      line(edgeX + sign * 3, y1, x + sign * 5, y1, 'ext');
      line(edgeX + sign * 3, y2, x + sign * 5, y2, 'ext');
      line(x, y1, x, y2, 'dl', state.camera, { 'marker-start': `url(#${drawingId}-arrow)`, 'marker-end': `url(#${drawingId}-arrow)` });
      const cy = (y1 + y2) / 2;
      text(x - 6, cy, label, 'dt', { 'text-anchor': 'middle', transform: `rotate(-90 ${x - 6} ${cy})` });
    }
    function callout(px, py, ex, ey, label, dir = 1, cls = 'dt') {
      circle(px, py, 1.8, 'dot');
      polyline(`${px},${py} ${ex},${ey} ${ex + dir * 10},${ey}`, 'lead');
      text(ex + dir * 14, ey + 4, label, cls, { 'text-anchor': dir > 0 ? 'start' : 'end' });
    }
    function noteBox(x, y, number) {
      rect(x - 7, y - 8, 14, 14, 0, 'nb');
      text(x, y + 3, String(number), 'nbt', { 'text-anchor': 'middle' });
    }
    function viewTitle(x, y, title, subtitle = '') {
      text(x, y, title, 'vt', { 'text-anchor': 'middle' });
      if (subtitle) text(x, y + 15, subtitle, 'dts', { 'text-anchor': 'middle' });
    }
    function table(x, y, title, rows) {
      const widths = [43, 122, 169], rh = 18;
      text(x, y - 8, title, 'vt');
      [['CODE', 'VARIABLE', 'VALUE'], ...rows].forEach((row, ri) => {
        let cx = x;
        row.forEach((value, ci) => {
          rect(cx, y + ri * rh, widths[ci], rh, 0, 'table-cell');
          text(cx + (ci ? widths[ci] / 2 : 5), y + ri * rh + 12.5, value, ri ? 'tc' : 'th', { 'text-anchor': ci ? 'middle' : 'start' });
          cx += widths[ci];
        });
      });
      return y + (rows.length + 1) * rh + 22;
    }

    function titleBlock() {
      const d = sheet.desktop, m = sheet.mobile;
      const fmt = n => Number(n).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
      const hLabel = sheet.kind === 'media' ? 'H1 · FRAME HEIGHT' : (sheet.kind === 'skill' ? 'H1 · CARD HEIGHT' : 'H · CARD HEIGHT');
      const keyH = sheet.kind === 'media' ? sheet.heights[0].desktop : d.height;
      const keyHm = sheet.kind === 'media' ? sheet.heights[0].mobile : m.height;
      canvas.innerHTML = `
        <header class="pbd-titleblock" aria-label="Dimensional drawing title block">
          <div class="pbd-tb-big"><div><div class="pbd-label">UI COMPONENT · DIMENSIONAL DRAWING</div><h2>${sheet.title}</h2></div><div class="pbd-tb-scope">${sheet.category} · ARCHITECTURE ONLY</div></div>
          <div><div class="pbd-label">DWG NO.</div><div class="pbd-value">${sheet.id}</div></div>
          <div><div class="pbd-label">REV</div><div class="pbd-value">B · 2026-11-10</div></div>
          <div><div class="pbd-label">SHEETS</div><div class="pbd-value">1</div></div>
          <div><div class="pbd-label">UNITS</div><div class="pbd-value">CSS PX @ 1×</div></div>
          <div><div class="pbd-label">SCALE</div><div class="pbd-value">AS NOTED</div></div>
          <div><div class="pbd-label">SOURCE</div><div class="pbd-value">${sheet.source}</div></div>
          <div class="pbd-notes">
            <div><div class="pbd-note-head">NOTES: <span>(UNLESS OTHERWISE SPECIFIED)</span></div><ol><li>Do not scale from the screen; use the measured CSS values.</li><li>Slots describe architecture; real copy and media content are omitted.</li><li>Only measured or published values are numeric; unknown dimensions are [TBD].</li></ol></div>
            <div><div class="pbd-note-head" aria-hidden="true">&nbsp;</div><ol start="4"><li>Component proportions are schematic except for measured outer frames.</li><li>Exploded layer separation is illustrative; exact depths are [TBD].</li><li>One drawing per shared card type; grayscale linework only.</li></ol></div>
          </div>
          <div class="pbd-figures">
            <div><div class="pbd-label">W · FRAME WIDTH</div><div class="pbd-figure-value">${d.width} / ${m.width}</div></div>
            <div><div class="pbd-label">${hLabel}</div><div class="pbd-figure-value">${fmt(keyH)} / ${fmt(keyHm)}</div></div>
            <div><div class="pbd-label">B · BORDER</div><div class="pbd-figure-value">${sheet.border}</div></div>
            <div><div class="pbd-label">R1 · OUTER RADIUS</div><div class="pbd-figure-value">${sheet.radius}</div></div>
            <div><div class="pbd-label">Y · SHADOW OFFSET</div><div class="pbd-figure-value">${sheet.shadow.y}</div></div>
            <div><div class="pbd-label">BL · SHADOW BLUR</div><div class="pbd-figure-value">${sheet.shadow.blur}</div></div>
          </div>
        </header>
        <svg class="pbd-svg" viewBox="0 0 1700 1060" role="img" aria-label="${sheet.title}: component-specific measured plan, exploded view, details and variable tables"></svg>
        <div class="pbd-sheet-footer"><span>2026-11-10 &nbsp;|&nbsp; UI COMPONENT REFERENCE</span><span><b>${sheet.title} · ARCHITECTURE</b> &nbsp;|&nbsp; 1 / 1</span></div>`;
      state.svg = canvas.querySelector('.pbd-svg');
    }

    function addNotes() {
      text(52, 68, 'NOTES:', 'nth');
      text(112, 68, '(UNLESS OTHERWISE SPECIFIED)', 'nt');
      const general = [
        'Card frame W / H measured at 1440 px and 390 px viewport widths.',
        'Internal spacing is measured only where shown; other gaps [TBD].',
        'Border, radius and shadow come from rendered computed CSS.',
        'Exploded spacing is schematic; all Z depths remain [TBD].',
        'Plan dimensions use variable codes resolved in the tables.',
        'No copied card copy, logos, photos or video frames in the drawing.'
      ];
      general.forEach((value, i) => { const yy = 96 + i * 22; noteBox(60, yy - 4, i + 1); text(78, yy, value, 'nt'); });
      text(52, 246, 'COMPONENT-SPECIFIC STRUCTURE', 'nth');
      sheet.notes.forEach((value, i) => text(52, 267 + i * 20, value, 'nt'));
    }

    function drawMedia(box) {
      const { x, y, w, h } = box;
      rect(x + 2, y + 2, w - 4, h - 4, 0, 'slot');
      line(x + w * .08, y + h * .08, x + w * .92, y + h * .92, 'ph');
      line(x + w * .92, y + h * .08, x + w * .08, y + h * .92, 'ph');
      text(x + w / 2, y + h / 2, 'MEDIA SLOT · FILL', 'sl', { 'text-anchor': 'middle' });
      text(x + w / 2, y + h * .70, 'SOURCE-ASPECT · IMAGE / VIDEO', 'dts', { 'text-anchor': 'middle' });
    }
    function drawSkill(box) {
      const { x, y, w, h } = box;
      const pad = 32 * (w / 645);
      rect(x + pad, y + pad * .38, w - pad * 2, h - pad * .76, 0, 'slot');
      rect(x + w - pad - 21, y + pad * .62, 15, 12, 0, 'well');
      text(x + w - pad - 13.5, y + pad * .62 + 9, 'IDX', 'dts', { 'text-anchor': 'middle' });
      text(x + pad + 1, y + h * .42, 'TITLE SLOT · HUG', 'sl');
      line(x + pad, y + h * .53, x + w * .72, y + h * .53, 'ext');
      text(x + pad + 1, y + h * .72, 'BODY SLOT · FLEX · WRAPS', 'sl');
      line(x + pad, y + h * .80, x + w * .83, y + h * .80, 'ext');
    }
    function drawStat(box) {
      const { x, y, w, h } = box;
      const inset = 0;
      rect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, 0, 'well');
      text(x + w / 2, y + h * .43, 'VALUE SLOT · HUG', 'sl', { 'text-anchor': 'middle' });
      line(x + w * .24, y + h * .56, x + w * .76, y + h * .56, 'ext');
      text(x + w / 2, y + h * .70, 'LABEL SLOT · FLEX', 'sl', { 'text-anchor': 'middle' });
    }
    function drawPlan() {
      const s = sheet;
      const scale = s.kind === 'skill' ? .55 : .42;
      const x = 660, y = 166, w = s.desktop.width * scale, h = s.desktop.height * scale;
      group(.12, .004, .72);
      viewTitle(x + w / 2, 125, 'PLAN VIEW', s.kind === 'media' ? 'IMAGE A · SHARED MEDIA FRAME · SOURCE CONTENT OMITTED' : (s.kind === 'skill' ? 'SKILL-CARD SKELETON · DESKTOP INSTANCE 01' : 'SHARED RESULT TILE · VALUE / LABEL SLOTS'));
      rect(x, y, w, h, s.radius * scale, 'obj');
      if (s.kind === 'media') drawMedia({ x: x + 2, y: y + 2, w: w - 4, h: h - 4 });
      else if (s.kind === 'skill') drawSkill({ x, y, w, h });
      else drawStat({ x: x + 2, y: y + 2, w: w - 4, h: h - 4 });
      group(1.20, .008, .45);
      dimH(x, x + w, y - 28, y, 'W');
      dimV(y, y + h, x - 30, x, s.kind === 'media' ? 'H1' : (s.kind === 'skill' ? 'H1' : 'H'));
      callout(x + w - 1, y + h * .78, x + w + 28, y + h * .78 - 17, 'R1', 1);
      noteBox(x + 13, y + 15, 1);
      const edgeNote = s.kind === 'skill' ? 'S1 = 32 · S2 = 10 · ALL OTHER INTERNAL SPACING [TBD]' : (s.kind === 'stat' ? 'S1 = 0 · S2 = 10 · S6 = 0' : 'S1 = 0 · SOURCE-ASPECT VARIES · INNER S6 = 0');
      text(x + w / 2, y + h + 24, edgeNote, 'dts', { 'text-anchor': 'middle' });
      return { x, y, w, h };
    }

    function drawShadowEnvelope() {
      const s = sheet, sx = 82, sy = 464, sw = 286, sh = sw * s.desktop.height / s.desktop.width;
      const px = sw / s.desktop.width, e1 = s.shadow.blur + s.shadow.spread - s.shadow.y;
      const e2 = s.shadow.blur + s.shadow.spread, e3 = s.shadow.blur + s.shadow.spread + s.shadow.y;
      group(2.0, .006, .50);
      viewTitle(sx + sw / 2, 425, 'SHADOW ENVELOPE', 'MEASURED CSS · SCHEMATIC FOOTPRINT');
      rect(sx - e2 * px, sy - e1 * px, sw + 2 * e2 * px, sh + (e1 + e3) * px, 0, 'env');
      rect(sx, sy, sw, sh, s.radius * px, 'obj');
      rect(sx, sy, sw, sh, s.radius * px, 'hatch', state.camera, { fill: `url(#${drawingId}-hatch)`, 'fill-opacity': '.20' });
      dimV(sy - e1 * px, sy, sx - e2 * px - 13, sx - e2 * px, 'E1');
      dimH(sx - e2 * px, sx, sy + sh + e3 * px + 14, sy + sh, 'E2');
      dimV(sy + sh, sy + sh + e3 * px, sx + sw + e2 * px + 13, sx + sw, 'E3');
      callout(sx + sw * .78, sy + 5, sx + sw + 42, sy - 8, 'BL', 1);
      callout(sx + sw * .72, sy + sh * .48, sx + sw + 42, sy + sh * .48, 'SP', 1);
      callout(sx + sw * .66, sy + sh - 4, sx + sw + 42, sy + sh + 15, 'Y', 1);
    }

    function layerTransform(lift) { return `matrix(.2303,.04165,-.0833,.11515,365,842 ${-lift ? `- ${lift}` : ''})`; }
    function addLayer(index, lift, start, draw) {
      const g = svgNode('g', { class: 'iso-layer', transform: 'matrix(.2303,.04165,-.0833,.11515,365,842)' }, state.camera, false);
      state.layers.push({ g, lift, start, duration: 1.15 });
      draw(g);
    }
    function drawLayerContent(index, parent) {
      const s = sheet, w = s.desktop.width, h = s.desktop.height;
      const rel = (x, y, rw, rh, cls = 'obj', r = 0) => rect(x * w, y * h, rw * w, rh * h, r, cls, parent);
      if (index === 0) rect(0, 0, w, h, 0, 'canvas-layer', parent);
      else if (s.kind === 'media') {
        if (index === 1) rect(0, 0, w, h, s.radius, 'obj', parent);
        if (index === 2) rel(.04, .04, .92, .92, 'slot');
        if (index === 3) rel(.04, .04, .92, .92, 'well');
        if (index === 4) rel(.03, .86, .94, .11, 'obj');
      } else if (s.kind === 'skill') {
        const p = s.pad / w;
        if (index === 1) rect(0, 0, w, h, s.radius, 'obj', parent);
        if (index === 2) rel(1 - p - .08, .12, .07, .12, 'well');
        if (index === 3) rel(p, .30, .58, .16, 'slot');
        if (index === 4) { rel(p, .55, .72, .12, 'slot'); rel(p, .72, .68, .10, 'slot'); }
      } else {
        if (index === 1) rect(0, 0, w, h, s.radius, 'obj', parent);
        if (index === 2) rel(.28, .29, .44, .25, 'slot');
        if (index === 3) rel(.20, .62, .60, .11, 'well');
        if (index === 4) line(.40 * w, .57 * h, .60 * w, .57 * h, 'ext', parent);
      }
    }
    function drawExploded() {
      group(3.75, .008, .45);
      viewTitle(492, 690, 'EXPLODED VIEW', 'AXONOMETRIC · LAYER HEIGHTS SCHEMATIC · Z# [TBD]');
      sheet.layers.forEach((label, i) => {
        const begin = 3.9 + i * .12;
        group(begin, .004, .52);
        addLayer(i, i * 19, begin + .08, parent => drawLayerContent(i, parent));
      });
      group(4.55, .035, .44);
      sheet.layers.forEach((label, i) => {
        const x0 = 365 + .2303 * sheet.desktop.width * .54 - .0833 * sheet.desktop.height * .10;
        const y0 = 842 + .04165 * sheet.desktop.width * .54 + .11515 * sheet.desktop.height * .10 - i * 19;
        line(330, y0, x0 - 5, y0, 'lead'); circle(x0 - 5, y0, 1.5, 'dot');
        text(321, y0 - 3, `Z${i + 1} · ${label}`, 'dts', { 'text-anchor': 'end' });
      });
    }

    function detailBox(x, y, w, h, title, sub) {
      rect(x, y, w, h, 0, 'thin');
      viewTitle(x + w / 2, y + 18, title, sub);
    }
    function mediaDetail(x, y, w, h, variant) {
      const measured = sheet.heights.find(item => item.code === variant);
      detailBox(x, y, w, h, variant === 'H2' ? 'DETAIL A · IMAGE B' : 'DETAIL B · VIDEO', variant === 'H2' ? 'SECOND IMAGE-ASPECT VARIANT' : 'SOURCE 16:9 · NATIVE CONTROLS');
      const frameW = w - 38, ratio = variant === 'H2' ? sheet.desktop.width / measured.desktop : 16 / 9;
      const frameH = frameW / ratio, fx = x + 19, fy = y + 58;
      rect(fx, fy, frameW, frameH, 2, 'obj');
      if (variant === 'H2') {
        rect(fx + 4, fy + 4, frameW - 8, frameH - 8, 0, 'slot');
        text(fx + frameW / 2, fy + frameH / 2 + 3, 'IMAGE SLOT · FILL', 'dts', { 'text-anchor': 'middle' });
      } else {
        rect(fx + 4, fy + 4, frameW - 8, frameH - 13, 0, 'well');
        rect(fx + 4, fy + frameH - 12, frameW - 8, 8, 0, 'thin');
        line(fx + 14, fy + frameH - 8, fx + frameW - 12, fy + frameH - 8, 'ext');
        text(fx + frameW / 2, fy + frameH / 2, 'VIDEO SLOT', 'dts', { 'text-anchor': 'middle' });
      }
      const dimLabel = variant === 'H2' ? 'H2' : 'H3';
      text(x + w / 2, y + h - 15, `${dimLabel} · ${measured.desktop} @1440 / ${measured.mobile} @390`, 'dts', { 'text-anchor': 'middle' });
    }
    function skillDetail(x, y, w, h) {
      detailBox(x, y, w, h, 'DETAIL A · SKILL-CARD BODY', 'MEASURED PAD S1 · GAP S2');
      rect(x + 20, y + 57, w - 40, h - 83, 0, 'well');
      rect(x + 34, y + 72, 19, 14, 0, 'slot');
      text(x + 43, y + 82, 'IDX', 'dts', { 'text-anchor': 'middle' });
      rect(x + 34, y + 100, w - 70, 17, 0, 'slot');
      text(x + 40, y + 112, 'TITLE SLOT · HUG', 'dts');
      line(x + 34, y + 125, x + w - 34, y + 125, 'ext');
      rect(x + 34, y + 136, w - 70, 27, 0, 'slot');
      text(x + 40, y + 153, 'BODY SLOT · FLEX · WRAPS', 'dts');
    }
    function statDetail(x, y, w, h) {
      detailBox(x, y, w, h, 'DETAIL A · RESULT TILE', 'SHARED BY TWO PROJECT CARDS');
      rect(x + 20, y + 58, w - 40, h - 84, 0, 'well');
      rect(x + 48, y + 72, w - 96, 44, 0, 'slot');
      text(x + w / 2, y + 99, 'VALUE SLOT · HUG', 'dts', { 'text-anchor': 'middle' });
      line(x + 48, y + 126, x + w - 48, y + 126, 'ext');
      rect(x + 48, y + 137, w - 96, 20, 0, 'slot');
      text(x + w / 2, y + 151, 'LABEL SLOT · FLEX', 'dts', { 'text-anchor': 'middle' });
    }
    function nestedCorner(x, y, w, h) {
      detailBox(x, y, w, h, 'DETAIL C · NESTED CORNER', 'SCALE 3:1 · INNER EDGE');
      path(`M${x + 20} ${y + 154} V${y + 95} A38 38 0 0 1 ${x + 58} ${y + 57} H${x + w - 20}`, 'obj');
      path(`M${x + 23} ${y + 154} V${y + 98} A35 35 0 0 1 ${x + 58} ${y + 63} H${x + w - 20}`, 'thin');
      callout(x + 57, y + 59, x + 76, y + 48, 'R1', 1);
      callout(x + 59, y + 64, x + 78, y + 81, 'R2', 1, 'dts');
      callout(x + 20, y + 108, x + 8, y + 123, 'B', -1, 'dts');
      text(x + w / 2, y + 176, `R2 = R1 − B − S6 = ${Number(sheet.radius - sheet.border - sheet.inner).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`, 'dts', { 'text-anchor': 'middle' });
    }
    function drawDetails() {
      group(6.05, .006, .40);
      if (sheet.kind === 'media') {
        mediaDetail(650, 758, 226, 188, 'H2');
        mediaDetail(886, 758, 226, 188, 'H3');
      } else if (sheet.kind === 'skill') {
        skillDetail(650, 758, 226, 188);
        detailBox(886, 758, 226, 188, 'DETAIL B · INSTANCE RANGE', 'FOUR MATCHING CARD INSTANCES');
        sheet.heights.forEach((item, i) => {
          const yy = 827 + i * 27;
          text(903, yy, `${item.code} · INSTANCE ${String(i + 1).padStart(2, '0')}`, 'dts');
          text(1093, yy, `${item.desktop} / ${item.mobile}`, 'dts', { 'text-anchor': 'end' });
          line(903, yy + 7, 1093, yy + 7, 'ext');
        });
      } else {
        statDetail(650, 758, 226, 188);
        detailBox(886, 758, 226, 188, 'DETAIL B · SLOT RELATION', 'MEASURED S2 = 10 PX');
        rect(916, 823, 166, 38, 0, 'well'); text(999, 847, 'VALUE SLOT · HUG', 'dts', { 'text-anchor': 'middle' });
        line(999, 861, 999, 876, 'dl', state.camera, { 'marker-end': `url(#${drawingId}-arrow)` });
        rect(916, 879, 166, 24, 0, 'slot'); text(999, 896, 'LABEL SLOT · FLEX', 'dts', { 'text-anchor': 'middle' });
      }
      nestedCorner(1122, 758, 186, 188);
    }

    function drawTables() {
      const x = 1324, s = sheet;
      let y = 83;
      group(2.45, .002, .45);
      const hRows = s.kind === 'media'
        ? [['W', 'frame-width', '865 @1440 / 375 @390'], ...s.heights.map(v => [v.code, v.label, `${v.desktop} / ${v.mobile}`])]
        : s.kind === 'skill'
          ? [['W', 'card-width', '645 @1440 / 375 @390'], ...s.heights.map(v => [v.code, v.label, `${v.desktop} / ${v.mobile}`])]
          : [['W', 'card-width', '865 @1440 / 375 @390'], ['H', 'card-height', '360 / 240']];
      y = table(x, y, 'SIZE · CSS PX @ 1×', hRows);
      const edge = [['B', 'border', String(s.border)], ['S1', s.kind === 'skill' ? 'card-padding' : 'card-padding', String(s.pad)], ['S2', s.kind === 'skill' ? 'title-body-gap' : 'slot-gap', String(s.gap)], ['S6', 'inner-inset', String(s.inner)]];
      y = table(x, y, 'EDGE / SPACING', edge);
      const innerR = Number(s.radius - s.border - s.inner).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
      y = table(x, y, 'RADIUS', [['R1', 'outer-radius', String(s.radius)], ['R2', 'inner-radius', `R1−B−S6 = ${innerR}`]]);
      const shadow = s.shadow, e1 = shadow.blur + shadow.spread - shadow.y, e2 = shadow.blur + shadow.spread, e3 = shadow.blur + shadow.spread + shadow.y;
      y = table(x, y, 'SHADOW · CSS PX', [
        ['Y', 'offset-y', String(shadow.y)], ['BL', 'blur', String(shadow.blur)], ['SP', 'spread', String(shadow.spread)],
        ['E1', 'top', `BL+SP−Y = ${e1}`], ['E2', 'side', `BL+SP = ${e2}`], ['E3', 'bottom', `BL+SP+Y = ${e3}`]
      ]);
      y = table(x, y, 'LAYER DEPTH · SCHEMATIC', s.layers.map((_, i) => [`Z${i + 1}`, `layer-${i + 1}`, '[TBD]']));
      if (s.facts) {
        const fy = Math.min(982, y + 4);
        s.facts.forEach((fact, i) => text(x, fy + i * 17, fact, 'nt'));
      }
    }

    function buildDrawing() {
      state.registry = []; state.layers = []; state.svg.replaceChildren();
      const defs = svgNode('defs', {}, state.svg, false);
      const marker = svgNode('marker', { id: `${drawingId}-arrow`, viewBox: '0 0 10 10', refX: 10, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs, false);
      svgNode('path', { d: 'M0 1.7 L10 5 L0 8.3 Z', class: 'arrow' }, marker, false);
      const hatch = svgNode('pattern', { id: `${drawingId}-hatch`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs, false);
      svgNode('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'hl' }, hatch, false);
      state.camera = svgNode('g', { class: 'pbd-camera' }, state.svg, false);
      group(8.15, 0, .90); rect(20, 20, 1660, 1020, 16, 'sheet-border');
      group(.03, .005, .46); addNotes();
      drawPlan(); drawShadowEnvelope(); drawTables(); drawExploded(); drawDetails();
      group(7.35, .008, .42);
      line(650, 970, 1307, 970, 'ph');
      text(652, 993, 'GENERAL NOTE · UNKNOWN INTERNAL SPACING / Z DEPTHS [TBD].', 'nt');
      text(1304, 1010, 'MEASURED FRAME VALUES · SCHEMATIC INTERNAL VIEWS', 'nt', { 'text-anchor': 'end' });
    }

    function cameraAt(t) {
      const keys = [
        { t: 0, cx: 850, cy: 280, z: 1.70 },
        { t: 2.1, cx: 850, cy: 290, z: 1.08 },
        { t: 3.8, cx: 493, cy: 840, z: 1.42 },
        { t: 5.6, cx: 493, cy: 840, z: 1.34 },
        { t: 7.8, cx: 850, cy: 530, z: 1.0 },
        { t: END_TIME, cx: 850, cy: 530, z: .992 }
      ];
      let a = keys[0], b = keys[keys.length - 1];
      for (let i = 0; i < keys.length - 1; i += 1) if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; break; }
      const p = easeInOut(clamp01((t - a.t) / Math.max(.001, b.t - a.t)));
      const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), p));
      return `translate(${850 - lerp(a.cx, b.cx, p) * z} ${530 - lerp(a.cy, b.cy, p) * z}) scale(${z})`;
    }
    function render(time) {
      const t = clamp01(time / END_TIME) * END_TIME;
      state.camera.setAttribute('transform', cameraAt(t));
      state.registry.forEach(item => {
        const p = clamp01((t - item.start) / item.duration);
        if (item.kind === 'fade') item.el.style.opacity = String(easeOut(p));
        else {
          item.el.style.opacity = '1';
          item.el.style.strokeDasharray = '1 2';
          item.el.style.strokeDashoffset = String(1 - easeInOut(p));
          const fill = item.el.getAttribute('fill') || '';
          if (fill && fill !== 'none') item.el.style.fillOpacity = String(easeOut(clamp01((p - .55) / .45)));
          if (p >= 1) { item.el.style.strokeDasharray = ''; item.el.style.strokeDashoffset = ''; item.el.style.fillOpacity = ''; }
        }
      });
      state.layers.forEach(layer => layer.g.setAttribute('transform', `matrix(.2303,.04165,-.0833,.11515,365,${842 - layer.lift * easeOut(clamp01((t - layer.start) / layer.duration))})`));
    }
    function initialize() {
      if (state.built) return;
      titleBlock(); buildDrawing(); state.built = true; stats.built += 1; details.classList.add('pbd-ready');
    }
    function play() {
      if (state.frame) cancelAnimationFrame(state.frame);
      stats.opened += 1;
      if (reduceMotion.matches) { render(END_TIME); return; }
      stats.animationRuns += 1;
      const begin = performance.now();
      const tick = now => {
        const seconds = (now - begin) / 1000; render(seconds);
        if (seconds < END_TIME) state.frame = requestAnimationFrame(tick);
        else { render(END_TIME); state.frame = 0; }
      };
      render(0); state.frame = requestAnimationFrame(tick);
    }
    details.addEventListener('toggle', () => {
      if (!details.open) { if (state.frame) cancelAnimationFrame(state.frame); state.frame = 0; return; }
      initialize(); requestAnimationFrame(play);
    });
    // "all" makes all three drawings ready, not a replacement view of the page.
    // Keep their disclosures closed until requested so the real cards stay primary.
    if (eagerDrawings) { initialize(); render(END_TIME); }
  }

  // One sheet for each actual reusable card component, not one sheet per project instance.
  insertSheet(projectRows[2], SHEETS[0], 0); // shared image/video thumbnail used by rows 1–3
  const skillAnchor = document.querySelector('#skills .skill-tags') || document.querySelector('#skills .container > .row');
  if (skillAnchor) insertSheet(skillAnchor, SHEETS[1], 1); // shared index/title/body skill card, used 4×
  insertSheet(projectRows[4], SHEETS[2], 2); // shared value/label result tile used by campus + business cards

  if (eagerDrawings) document.body.classList.add('pbd-review-all');
  reduceMotion.addEventListener?.('change', event => { stats.reducedMotion = event.matches; });
})();
