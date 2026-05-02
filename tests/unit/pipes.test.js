import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import {
  BIRD_X, BIRD_SIZE, CANVAS_HEIGHT, PIPE_INTERVAL, PIPE_SPEED, PIPE_WIDTH,
  GAP_MIN_Y, GROUND_HEIGHT, GAP_SIZE, PIPE_SPAWN_X, BURGER_SIZE
} from '../../src/constants.js';

function makePlaying(overrides = {}) {
  return {
    phase: 'PLAYING',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: 0,
    ...overrides,
  };
}

function makePlayingFull(overrides = {}) {
  return {
    phase: 'PLAYING',
    bird: {
      x: BIRD_X,
      y: CANVAS_HEIGHT / 2,
      vy: 0,
      rotation: 0,
      currentSize: BIRD_SIZE,
      enlarged: false,
      enlargeTimer: 0,
    },
    pipes: [],
    score: 0,
    lastPipeTime: 0,
    pendingBurger: false,
    lastTimestamp: 0,
    highScore: 0,
    ...overrides,
  };
}

// Feature: mango-the-dove-game, Property 6: Pipes spawn after interval elapses
describe('P6: Pipes spawn after interval elapses', () => {
  it('pipes array grows by 1 when timestamp - lastPipeTime >= PIPE_INTERVAL', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000 }), (lastPipeTime) => {
        const timestamp = lastPipeTime + PIPE_INTERVAL;
        const state = makePlaying({ lastPipeTime });
        const pipesBefore = state.pipes.length;
        update(state, timestamp);
        expect(state.pipes.length).toBe(pipesBefore + 1);
      })
    );
  });

  it('pipes array does not grow when interval has not elapsed', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000000 }), (lastPipeTime) => {
        const timestamp = lastPipeTime + PIPE_INTERVAL - 1;
        const state = makePlaying({ lastPipeTime });
        update(state, timestamp);
        expect(state.pipes.length).toBe(0);
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 7: All pipe gaps are within the playable vertical range
describe('P7: All pipe gaps are within the playable vertical range', () => {
  it('gapY is within [GAP_MIN_Y, CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - GAP_MIN_Y]', () => {
    const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - GAP_MIN_Y;
    // Spawn many pipes and check all gapY values
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (seed) => {
        const state = makePlaying({ lastPipeTime: 0 });
        // Trigger multiple pipe spawns
        for (let i = 0; i < 10; i++) {
          update(state, i * PIPE_INTERVAL);
        }
        for (const pipe of state.pipes) {
          expect(pipe.gapY).toBeGreaterThanOrEqual(GAP_MIN_Y);
          expect(pipe.gapY).toBeLessThanOrEqual(maxGapY);
        }
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 8: Pipes move left by PIPE_SPEED each tick
describe('P8: Pipes move left by PIPE_SPEED each tick', () => {
  it('each pipe.x decreases by PIPE_SPEED after one tick', () => {
    fc.assert(
      fc.property(fc.float({ min: 100, max: 1000, noNaN: true }), (pipeX) => {
        const state = makePlaying({
          pipes: [{ x: pipeX, gapY: 200, scored: false }],
          lastPipeTime: Number.MAX_SAFE_INTEGER,
        });
        update(state, Number.MAX_SAFE_INTEGER);
        // The pipe should have moved left by PIPE_SPEED (if not removed)
        const remaining = state.pipes.filter(p => p.gapY === 200);
        if (remaining.length > 0) {
          expect(remaining[0].x).toBeCloseTo(pipeX - PIPE_SPEED, 5);
        }
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 9: Off-screen pipes are removed
describe('P9: Off-screen pipes are removed', () => {
  it('no pipe has x + PIPE_WIDTH < 0 after an update tick', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.float({ min: -500, max: 1000, noNaN: true }),
          { minLength: 0, maxLength: 10 }
        ),
        (xValues) => {
          const pipes = xValues.map(x => ({ x, gapY: 200, scored: false }));
          const state = makePlaying({
            pipes,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
          });
          update(state, Number.MAX_SAFE_INTEGER);
          for (const pipe of state.pipes) {
            expect(pipe.x + PIPE_WIDTH).toBeGreaterThanOrEqual(0);
          }
        }
      )
    );
  });
});

// Feature: mango-the-dove-game, Property 18: Burger spawns on next pipe if and only if pendingBurger is true
describe('P18: Burger spawns on next pipe if and only if pendingBurger is true', () => {
  it('burger is present iff pendingBurger was true before spawn', () => {
    fc.assert(
      fc.property(fc.boolean(), (pendingBurger) => {
        const state = makePlayingFull({
          pendingBurger,
          lastPipeTime: 0,
        });
        update(state, PIPE_INTERVAL);
        expect(state.pipes.length).toBeGreaterThanOrEqual(1);
        const pipe = state.pipes[0];
        if (pendingBurger) {
          expect(pipe.burger).not.toBeNull();
          expect(state.pendingBurger).toBe(false);
        } else {
          expect(pipe.burger).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 19: Burger position is centered on pipe and in the bottom half of the gap
describe('P19: Burger position is centered on pipe and in the bottom half of the gap', () => {
  it('burger x is centered on pipe at spawn and burger y is in the bottom half of the gap', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: GAP_MIN_Y, max: CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - GAP_MIN_Y }),
        (_gapY) => {
          // gapY inside update.js is randomised, so we verify the invariant on
          // whatever gapY was actually generated rather than trying to control it.
          const state = makePlayingFull({
            pendingBurger: true,
            lastPipeTime: 0,
          });
          update(state, PIPE_INTERVAL);
          expect(state.pipes.length).toBeGreaterThanOrEqual(1);
          const pipe = state.pipes[0];
          expect(pipe.burger).not.toBeNull();

          // Burger x is computed at spawn time centered on the pipe, and moves with it each tick.
          // After one tick both pipe.x and burger.x have shifted by -PIPE_SPEED, so the
          // centering relationship holds relative to the current pipe.x.
          const expectedBurgerX = pipe.x + PIPE_WIDTH / 2 - BURGER_SIZE / 2;
          expect(pipe.burger.x).toBe(expectedBurgerX);

          // Burger y must be in the bottom half of the gap
          expect(pipe.burger.y).toBeGreaterThanOrEqual(pipe.gapY + GAP_SIZE / 2);
          expect(pipe.burger.y + BURGER_SIZE).toBeLessThanOrEqual(pipe.gapY + GAP_SIZE);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 20: At most one burger per pipe pair at any time
describe('P20: At most one burger per pipe pair at any time', () => {
  it('no pipe ever has more than one burger after multiple ticks', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (n) => {
        const state = makePlayingFull({
          pendingBurger: true,
          lastPipeTime: 0,
        });
        for (let i = 1; i <= n; i++) {
          update(state, i * PIPE_INTERVAL);
          for (const pipe of state.pipes) {
            // burger must be null or a single object — never an array
            expect(Array.isArray(pipe.burger)).toBe(false);
            if (pipe.burger !== null) {
              expect(typeof pipe.burger).toBe('object');
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
