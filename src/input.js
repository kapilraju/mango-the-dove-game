/**
 * Input handling for Mango The Dove.
 * Listens for keydown and touchstart events, calling the provided callback
 * when the spacebar is pressed or the screen is tapped.
 */

/**
 * Initializes keyboard and touch input handling.
 * @param {Function} onAction - Callback invoked on spacebar press or screen tap.
 * @param {HTMLCanvasElement} [canvas] - Unused, kept for API compatibility.
 */
export function initInput(onAction, canvas) {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      onAction();
    }
  });

  // Listen on document so any tap anywhere on the screen triggers the action.
  // passive:false is required to allow preventDefault() on iOS Safari / Android Chrome.
  document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    onAction();
  }, { passive: false });
}
