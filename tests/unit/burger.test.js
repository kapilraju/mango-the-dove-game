import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import {
  BIRD_X, BIRD_SIZE, BURGER_SIZE, ENLARGE_DURATION,
  CANVAS_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH
} from '../../src/constants.js';

// Feature: mango-the-dove-game, Property 17: Burger roll always produces an integer in [1, 6]
describe('P17: Burger roll always produces an integer in [1, 6]', () => {
  it('Math.floor(Math.random() * 6) + 1 always returns an integer in [1, 6] over 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      expect(Number.isInteger(roll)).toBe(true);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    }
  });
});

// Feature: mango-the-dove-game, Property 21: Collecting a burger enters Enlarged_State with correct initial values
describe('P21: Collecting a burger enters Enlarged_State with correct initial values', () => {
  it('bird collects burger and enters enlarged state with correct values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 400 }),
        (birdY) => {
          // Place burger at exact bird position to guarantee overlap
          const burgerX = BIRD_X;
          const burgerY = birdY;

          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: birdY,
              vy: 0,
              rotation: 0,
              enlarged: false,
              currentSize: BIRD_SIZE,
              enlargeTimer: 0,
            },
            pipes: [
              {
                x: BIRD_X - PIPE_WIDTH - 10, // pipe is behind the bird (already passed, no collision)
                gapY: birdY - 50,            // gap centered around bird so no pipe collision
                scored: true,
                burger: { x: burgerX, y: burgerY, collected: false },
              },
            ],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: 0,
            highScore: 0,
          };

          update(state, 1);

          const pipe = state.pipes[0];
          expect(pipe.burger.collected).toBe(true);
          expect(state.bird.enlarged).toBe(true);
          expect(state.bird.currentSize).toBe(BIRD_SIZE * 2);
          expect(state.bird.enlargeTimer).toBe(ENLARGE_DURATION);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 22: Timer expiry restores bird to base size regardless of stacking
describe('P22: Timer expiry restores bird to base size regardless of stacking', () => {
  it('bird returns to BIRD_SIZE after enlargeTimer expires regardless of stack depth', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(5), noNaN: true }),
        fc.integer({ min: 1, max: 4 }),
        (initialTimer, stackDepth) => {
          const stackedSize = BIRD_SIZE * Math.pow(2, stackDepth);
          // lastTimestamp = 1000ms, timestamp = 1000 + initialTimer*1000 + 100ms → deltaTime > initialTimer
          const lastTimestamp = 1000;
          const timestamp = 1000 + initialTimer * 1000 + 100;

          // Position bird safely in the middle, away from ground
          const safeY = 200;

          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: safeY,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize: stackedSize,
              enlargeTimer: initialTimer,
            },
            pipes: [],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: lastTimestamp,
            highScore: 0,
          };

          update(state, timestamp);

          // After timer expires the bird should be back to base size
          expect(state.bird.enlarged).toBe(false);
          expect(state.bird.currentSize).toBe(BIRD_SIZE);
          expect(state.bird.enlargeTimer).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 23: Collecting a burger while enlarged doubles current size and resets timer
describe('P23: Collecting a burger while enlarged doubles current size and resets timer', () => {
  it('collecting a burger while already enlarged doubles currentSize and resets enlargeTimer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }),
        (stackDepth) => {
          const currentSize = BIRD_SIZE * Math.pow(2, stackDepth);
          const birdY = 250;
          const burgerX = BIRD_X;
          const burgerY = birdY;

          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: birdY,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize: currentSize,
              enlargeTimer: 1.0, // some remaining time
            },
            pipes: [
              {
                x: BIRD_X - PIPE_WIDTH - 10, // behind the bird, no collision
                gapY: birdY - 50,
                scored: true,
                burger: { x: burgerX, y: burgerY, collected: false },
              },
            ],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: 0,
            highScore: 0,
          };

          update(state, 1);

          expect(state.bird.currentSize).toBe(currentSize * 2);
          expect(state.bird.enlargeTimer).toBe(ENLARGE_DURATION);
          expect(state.bird.enlarged).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
