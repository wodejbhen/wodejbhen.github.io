(() => {
  'use strict';
  const url = new URL(window.location.href);
  // The old review link accidentally opened halfway down the portfolio.
  // Normalize only that initial link; in-page section links still work normally.
  if (url.searchParams.get('drawings') === 'all' && url.hash === '#projects') {
    url.hash = '';
    history.replaceState(history.state, '', url.pathname + url.search);
  }
  if (!window.location.hash && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
})();
