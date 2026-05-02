/**
 * Lightweight analytics wrapper for Mango The Dove.
 *
 * Sends custom events to Google Analytics 4 (via gtag.js).
 * All calls are no-ops if gtag is not loaded, so the game works
 * fine without analytics configured.
 *
 * To enable:
 * 1. Add your GA4 script tags to index.html (see comments there)
 * 2. Events will start flowing automatically
 */

function gtag_event(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

/** Player starts a new game from the START screen */
export function trackGameStart() {
  gtag_event('game_start');
}

/** Player dies — record final score and high score */
export function trackGameOver(score, highScore) {
  gtag_event('game_over', {
    score,
    high_score: highScore,
  });
}

/** Player collects a burger power-up */
export function trackBurgerCollected() {
  gtag_event('burger_collected');
}

/** Player restarts from the GAME_OVER screen */
export function trackRestart() {
  gtag_event('game_restart');
}
