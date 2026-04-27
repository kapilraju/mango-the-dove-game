import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock requestAnimationFrame and cancelAnimationFrame in the global scope
// before importing the module under test
let rafCallbacks = [];
let rafHandleCounter = 0;

global.requestAnimationFrame = vi.fn((cb) => {
  const handle = ++rafHandleCounter;
  rafCallbacks.push({ handle, cb });
  return handle;
});

global.cancelAnimationFrame = vi.fn((handle) => {
  rafCallbacks = rafCallbacks.filter(entry => entry.handle !== handle);
});

// Import after globals are set up
const { startLoop, stopLoop } = await import('../../src/loop.js');

beforeEach(() => {
  rafCallbacks = [];
  rafHandleCounter = 0;
  vi.clearAllMocks();
});

afterEach(() => {
  stopLoop();
});

function flushOneFrame(timestamp = 0) {
  const pending = [...rafCallbacks];
  rafCallbacks = [];
  for (const { cb } of pending) cb(timestamp);
}

describe('startLoop', () => {
  it('calls requestAnimationFrame to schedule the first frame', () => {
    const state = {};
    startLoop(state, vi.fn(), vi.fn());
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('calls update and render each frame with state and timestamp', () => {
    const state = { phase: 'PLAYING' };
    const update = vi.fn();
    const render = vi.fn();

    startLoop(state, update, render);
    flushOneFrame(100);

    expect(update).toHaveBeenCalledWith(state, 100);
    expect(render).toHaveBeenCalledWith(state);
  });

  it('schedules the next frame after each tick', () => {
    const state = {};
    startLoop(state, vi.fn(), vi.fn());
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    flushOneFrame(16);
    // After the first frame runs, another rAF should be scheduled
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('calls update before render each frame', () => {
    const callOrder = [];
    const state = {};
    const update = vi.fn(() => callOrder.push('update'));
    const render = vi.fn(() => callOrder.push('render'));

    startLoop(state, update, render);
    flushOneFrame(0);

    expect(callOrder).toEqual(['update', 'render']);
  });
});

describe('stopLoop', () => {
  it('cancels the pending rAF handle', () => {
    const state = {};
    startLoop(state, vi.fn(), vi.fn());
    stopLoop();
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('does not call update or render after stopLoop', () => {
    const state = {};
    const update = vi.fn();
    const render = vi.fn();

    startLoop(state, update, render);
    stopLoop();
    flushOneFrame(0); // nothing should be in the queue

    expect(update).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
  });

  it('is safe to call when no loop is running', () => {
    expect(() => stopLoop()).not.toThrow();
    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });
});
