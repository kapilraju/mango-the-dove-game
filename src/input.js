/**
 * Input handling for Mango The Dove.
 * Listens for keydown and touchstart events, calling the provided callback
 * when the spacebar is pressed or the screen is tapped.
 */

/**
 * Initializes keyboard and touch input handling.
 * @param {Function} onSpacebar - Callback invoked when the spacebar is pressed or screen is tapped.
 */
export function initInput(onSpacebar) {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      onSpacebar();
    }
  });

  // passive: false is required to allow preventDefault() on iOS Safari and Android Chrome
  window.addEventListener('touchstart', (event) => {
    event.preventDefault();
    onSpacebar();
  }, { passive: false });
}
