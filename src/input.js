/**
 * Input handling for Mango The Dove.
 * Listens for keydown events and calls the provided callback when spacebar is pressed.
 */

/**
 * Initializes keyboard input handling.
 * @param {Function} onSpacebar - Callback invoked when the spacebar key is pressed.
 */
export function initInput(onSpacebar) {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      onSpacebar();
    }
  });
}
