/* Small platform fixes that CSS cannot make on its own.
   Loaded after the built bundle; reads nothing, sends nothing. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const coarse = !hoverFine.matches;

  // VanillaTilt reads the gyroscope on touch devices, so cards tilt while the
  // page is being scrolled. Tilt is desktop polish only.
  const dropTilt = () => {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const tilt = el.vanillaTilt;
      if (tilt && typeof tilt.destroy === 'function') tilt.destroy();
    });
  };
  if (coarse || reduce.matches) dropTilt();

  // The counter in the bundle animates 0 → 59% on scroll. If that observer
  // never fires (reduced motion, older browser), the page must still show the
  // real number rather than an animated 0.
  const settleCounters = () => {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = el.dataset.count;
      if (!target) return;
      const suffix = el.dataset.suffix || '';
      if (el.textContent.trim() !== target + suffix) {
        el.textContent = target + suffix;
      }
    });
  };
  if (reduce.matches) {
    settleCounters();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) settleCounters();
    });
  }
})();
