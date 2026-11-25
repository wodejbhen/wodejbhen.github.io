/* Interaction layer: scroll state, section wayfinding, reveal, mobile sheet.
   No dependencies. Everything degrades to a readable static page. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  /* ---- Sticky nav: material weight appears once content is under it ---- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Wayfinding: the section you are reading is marked ---- */
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = '#' + entry.target.id;
          links.forEach((a) =>
            a.setAttribute('aria-current', a.getAttribute('href') === id ? 'true' : 'false')
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---- Reveal: one entrance per block, 60ms apart, never blocks input ---- */
  const reveals = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window) || reduce.matches) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---- Mobile menu: a sheet over the page, not a new page ---- */
  let lastFocus = null;

  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    menu.hidden = false;
    // Let the hidden attribute flip before the transition starts.
    requestAnimationFrame(() => menu.classList.toggle('is-open', open));
    document.body.classList.toggle('is-locked', open);
    if (open) {
      lastFocus = document.activeElement;
      const first = menu.querySelector('a');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 260);
    } else {
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
      setTimeout(() => {
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      }, 320);
    }
  };

  menuBtn.addEventListener('click', () => {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
    // Keep focus inside the open sheet.
    if (event.key === 'Tab' && menu.classList.contains('is-open')) {
      const focusables = [menuBtn, ...menu.querySelectorAll('a')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // A resize that crosses back to desktop leaves no orphaned sheet.
  const desktop = window.matchMedia('(min-width: 834px)');
  desktop.addEventListener?.('change', (e) => {
    if (e.matches && menu.classList.contains('is-open')) setMenu(false);
  });
})();
