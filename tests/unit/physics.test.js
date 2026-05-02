import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update, flap } from '../../src/update.js';
import { BIRD_X, BIRD_SIZE, GRAVITY, FLAP_IMPULSE, CANVAS_HEIGHT, GROUND_HEIGHT } from '../../src/constants.js';

// Standard frame: 1/60s ≈ 16.667ms
const FRAME_MS = 1000 / 60;
const DT = FRAME_MS / 1000; // seconds per frame

function makePlaying(overrides = {}) {
  return {
    phase: 'PLAYING',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: Number.MAX_SAFE_INTEGER,
    pendingBurger: false,
    lastTimestamp: 1000, // non-zero so deltaTime is computed
    highScore: 0,
    ...overrides,
  };
}

// Feature: mango-the-dove-game, Property 1: Bird horizontal position is invariant
describe('P1: Bird x never changes after N ticks', () => {
  it('bird.x stays equal to BIRD_X after any number of ticks', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (ticks) => {
        const state = makePlaying();
        for (let i = 0; i < ticks; i++) {
          // Position bird safely in the middle to avoid ground collision
          state.bird.y = 200;
          state.bird.vy = 0;
          update(state, state.lastTimestamp + FRAME_MS);
        }
        expect(state.bird.x).toBe(BIRD_X);
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 2: Physics tick correctly updates velocity and position
describe('P2: Physics tick correctly updates velocity and position', () => {
  it('vy increases by GRAVITY*dt and y updates by new vy*dt each tick', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -300, max: 300, noNaN: true }),
        fc.float({ min: 10, max: 400, noNaN: true }),
        (vy, y) => {
          const state = makePlaying({ bird: { x: BIRD_X, y, vy, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 } });
          const expectedVy = vy + GRAVITY * DT;
          const expectedY = y + expectedVy * DT;
          // Skip if would hit ground
          if (expectedY + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT) return;
          update(state, state.lastTimestamp + FRAME_MS);
          // Only check if no ceiling clamp occurred
          if (expectedY >= 0) {
            expect(state.bird.vy).toBeCloseTo(expectedVy, 3);
            expect(state.bird.y).toBeCloseTo(expectedY, 3);
          }
        }
      )
    );
  });
});

// Feature: mango-the-dove-game, Property 3: Flap sets velocity to upward impulse
describe('P3: Flap sets vy to -FLAP_IMPULSE', () => {
  it('flap sets bird.vy to -FLAP_IMPULSE regardless of prior vy', () => {
    fc.assert(
      fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (vy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 } });
        flap(state);
        expect(state.bird.vy).toBe(-FLAP_IMPULSE);
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 5: Bird y clamped at ceiling
describe('P5: Bird y clamped at ceiling', () => {
  it('bird.y is never negative after an update tick', () => {
    fc.assert(
      fc.property(fc.float({ min: -500, max: Math.fround(-0.01), noNaN: true }), (y) => {
        // Give a large negative vy so bird would go further negative
        const state = makePlaying({ bird: { x: BIRD_X, y, vy: -500, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 } });
        update(state, state.lastTimestamp + FRAME_MS);
        expect(state.bird.y).toBeGreaterThanOrEqual(0);
      })
    );
  });
});

// Feature: mango-the-dove-game, Property 14: Bird rotation reflects vertical velocity
describe('P14: Bird rotation reflects vertical velocity', () => {
  it('rotation is positive when falling (positive vy)', () => {
    fc.assert(
      fc.property(fc.float({ min: 100, max: 1000, noNaN: true }), (posVy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: 200, vy: posVy, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 } });
        update(state, state.lastTimestamp + FRAME_MS);
        // After falling (positive vy), rotation should be positive
        expect(state.bird.rotation).toBeGreaterThan(0);
        // Clamped within [-PI/6, PI/2]
        expect(state.bird.rotation).toBeLessThanOrEqual(Math.PI / 2);
      })
    );
  });

  it('rotation is negative after flap (negative vy)', () => {
    fc.assert(
      fc.property(fc.float({ min: -1000, max: -100, noNaN: true }), (negVy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: 200, vy: negVy, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 } });
        update(state, state.lastTimestamp + FRAME_MS);
        // After flap (negative vy), rotation should be negative (clamped at -PI/6)
        expect(state.bird.rotation).toBeGreaterThanOrEqual(-Math.PI / 6);
        expect(state.bird.rotation).toBeLessThanOrEqual(0);
      })
    );
  });
});
