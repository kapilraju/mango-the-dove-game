import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update, flap } from '../../src/update.js';
import { BIRD_X, GRAVITY, FLAP_IMPULSE, CANVAS_HEIGHT } from '../../src/constants.js';

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

// Feature: flappy-bird-game, Property 1: Bird horizontal position is invariant
describe('P1: Bird x never changes after N ticks', () => {
  it('bird.x stays equal to BIRD_X after any number of ticks', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (ticks) => {
        const state = makePlaying();
        // Use a timestamp far enough to avoid pipe spawning interference
        for (let i = 0; i < ticks; i++) {
          update(state, 0); // timestamp 0, lastPipeTime 0 → pipe spawns once then no more
        }
        expect(state.bird.x).toBe(BIRD_X);
      })
    );
  });
});

// Feature: flappy-bird-game, Property 2: Physics tick correctly updates velocity and position
describe('P2: Physics tick correctly updates velocity and position', () => {
  it('vy increases by GRAVITY and y updates by new vy each tick', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -50, max: 50, noNaN: true }),
        fc.float({ min: 10, max: 500, noNaN: true }),
        (vy, y) => {
          const state = makePlaying({ bird: { x: BIRD_X, y, vy, rotation: 0 } });
          // Use a timestamp that won't trigger pipe spawn
          state.lastPipeTime = Number.MAX_SAFE_INTEGER;
          const expectedVy = vy + GRAVITY;
          const expectedY = y + expectedVy;
          update(state, Number.MAX_SAFE_INTEGER);
          // Only check if no ceiling clamp occurred
          if (expectedY >= 0) {
            expect(state.bird.vy).toBeCloseTo(expectedVy, 5);
            expect(state.bird.y).toBeCloseTo(expectedY, 5);
          }
        }
      )
    );
  });
});

// Feature: flappy-bird-game, Property 3: Flap sets velocity to upward impulse
describe('P3: Flap sets vy to -FLAP_IMPULSE', () => {
  it('flap sets bird.vy to -FLAP_IMPULSE regardless of prior vy', () => {
    fc.assert(
      fc.property(fc.float({ min: -100, max: 100, noNaN: true }), (vy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy, rotation: 0 } });
        flap(state);
        expect(state.bird.vy).toBe(-FLAP_IMPULSE);
      })
    );
  });
});

// Feature: flappy-bird-game, Property 5: Bird y clamped at ceiling
describe('P5: Bird y clamped at ceiling', () => {
  it('bird.y is never negative after an update tick', () => {
    fc.assert(
      fc.property(fc.float({ min: -500, max: Math.fround(-0.01), noNaN: true }), (y) => {
        // Give a large negative vy so bird would go further negative
        const state = makePlaying({ bird: { x: BIRD_X, y, vy: -20, rotation: 0 } });
        state.lastPipeTime = Number.MAX_SAFE_INTEGER;
        update(state, Number.MAX_SAFE_INTEGER);
        expect(state.bird.y).toBeGreaterThanOrEqual(0);
      })
    );
  });
});

// Feature: flappy-bird-game, Property 14: Bird rotation reflects vertical velocity
describe('P14: Bird rotation reflects vertical velocity', () => {
  it('rotation is negative after flap (negative vy) and positive when falling (positive vy)', () => {
    fc.assert(
      fc.property(fc.float({ min: 1, max: 100, noNaN: true }), (posVy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: posVy, rotation: 0 } });
        state.lastPipeTime = Number.MAX_SAFE_INTEGER;
        update(state, Number.MAX_SAFE_INTEGER);
        // After falling (positive vy), rotation should be positive
        expect(state.bird.rotation).toBeGreaterThan(0);
        // Clamped within [-PI/6, PI/2]
        expect(state.bird.rotation).toBeLessThanOrEqual(Math.PI / 2);
      })
    );
  });

  it('rotation is negative after flap (negative vy)', () => {
    fc.assert(
      fc.property(fc.float({ min: -100, max: -1, noNaN: true }), (negVy) => {
        const state = makePlaying({ bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: negVy, rotation: 0 } });
        state.lastPipeTime = Number.MAX_SAFE_INTEGER;
        update(state, Number.MAX_SAFE_INTEGER);
        // After flap (negative vy), rotation should be negative (clamped at -PI/6)
        expect(state.bird.rotation).toBeGreaterThanOrEqual(-Math.PI / 6);
        expect(state.bird.rotation).toBeLessThanOrEqual(0);
      })
    );
  });
});
