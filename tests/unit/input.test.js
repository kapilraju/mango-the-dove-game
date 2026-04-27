/**
 * Tests for touch-based and keyboard input handling.
 * Feature: mango-the-dove-game — touch input support (Requirement 7)
 *
 * Uses jsdom environment (via vitest) to simulate DOM events.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initInput } from '../../src/input.js';

// jsdom doesn't implement the Touch constructor, so we dispatch a plain
// cancelable TouchEvent (the listener only calls preventDefault + callback,
// it doesn't inspect touch coordinates).
function fireTouchStart(target) {
  const event = new Event('touchstart', { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function fireSpacebar() {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: ' ', cancelable: true, bubbles: true })
  );
}

describe('Requirement 7: Touch input support', () => {
  let callback;
  let canvas;

  beforeEach(() => {
    callback = vi.fn();
    canvas = document.createElement('canvas');
  });

  // R7.1 / R7.2 / R7.3 — tap triggers the action callback
  // The listener is on document, so canvas taps bubble up and trigger it
  it('calls the action callback when the screen is tapped', () => {
    initInput(callback, canvas);
    document.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls the action callback on every tap', () => {
    initInput(callback, canvas);
    document.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    document.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    document.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(callback).toHaveBeenCalledTimes(3);
  });

  // R7.4 — preventDefault is called to suppress scroll/zoom
  it('calls preventDefault on the touch event to suppress scroll/zoom', () => {
    initInput(callback, canvas);
    const event = new Event('touchstart', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  // Keyboard still works alongside touch
  it('calls the action callback when spacebar is pressed', () => {
    initInput(callback, canvas);
    fireSpacebar();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('spacebar and tap both trigger the same callback', () => {
    initInput(callback, canvas);
    fireSpacebar();
    document.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  // Touch listener is on document — tap anywhere triggers the callback
  it('falls back to document touch listener when no canvas is passed', () => {
    initInput(callback);
    document.dispatchEvent(
      new Event('touchstart', { bubbles: true, cancelable: true })
    );
    expect(callback).toHaveBeenCalledTimes(1);
  });

  // Non-space keys do not trigger the callback
  it('does not call the callback for non-space keys', () => {
    initInput(callback, canvas);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(callback).not.toHaveBeenCalled();
  });
});
