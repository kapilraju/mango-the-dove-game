/**
 * Input handling for Mango The Dove.
 * Listens for keydown on window and touchstart on the canvas element,
 * calling the provided callback when the spacebar is pressed or screen is tapped.
 */

/**
 * Initializes keyboard and touch input handling.
 * @param {Function} onAction - Callback invoked on spacebar press or screen tap.
 * @param {HTMLCanvasElement} canvas - The game canvas element to attach touch events to.
 */
export function initInput(onAction, canvas) {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      onAction();
    }
  });

  // Attach to canvas so touch-action:none CSS takes effect and passive:false works reliably
  const touchTarget = canvas || window;
  touchTarget.addEventListener('touchstart', (event) => {
    event.preventDefault();
    onAction();
  }, { passive: false });
}
