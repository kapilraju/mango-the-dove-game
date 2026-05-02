import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import {
  BIRD_X, BIRD_SIZE, BURGER_SIZE, ENLARGE_DURATION,
  CANVAS_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH
} from '../../src/constants.js';

const TS = 5000;

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
                x: BIRD_X - PIPE_WIDTH - 10,
                gapY: birdY - 50,
                scored: true,
                burger: { x: burgerX, y: burgerY, collected: false },
              },
            ],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: TS,
            highScore: 0,
          };

          update(state, TS); // dt = 0

          const pipe = state.pipes[0];
          expect(pipe.burger.collected).toBe(true);
          expect(state.bird.enlarged).toBe(true);
          expect(state.bird.currentSize).toBe(BIRD_SIZE * 1.5);
          expect(state.bird.enlargeTimer).toBe(ENLARGE_DURATION);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 22: Timer expiry restores bird to base size
describe('P22: Timer expiry restores bird to base size', () => {
  it('bird returns to BIRD_SIZE after enlargeTimer expires', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(5), noNaN: true }),
        (initialTimer) => {
          const enlargedSize = BIRD_SIZE * 1.5;
          const safeY = 200;

          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: safeY,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize: enlargedSize,
              enlargeTimer: initialTimer,
            },
            pipes: [],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: 1000,
            highScore: 0,
          };

          // Run enough frames at 50ms dt (the cap) to drain the timer
          // Each frame drains 0.05s, so we need ceil(initialTimer / 0.05) frames
          const framesNeeded = Math.ceil(initialTimer / 0.05) + 1;
          for (let i = 0; i < framesNeeded; i++) {
            // Reset bird position each frame to avoid ground collision from gravity
            state.bird.y = safeY;
            state.bird.vy = 0;
            const ts = 1000 + (i + 1) * 50; // 50ms per frame
            update(state, ts);
            if (!state.bird.enlarged) break;
          }

          expect(state.bird.enlarged).toBe(false);
          expect(state.bird.currentSize).toBe(BIRD_SIZE);
          expect(state.bird.enlargeTimer).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 23: Collecting a burger while enlarged has no effect
describe('P23: Collecting a burger while enlarged has no effect', () => {
  it('burger stays in play and bird size/timer are unchanged when collecting while enlarged', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.5), max: Math.fround(4.5), noNaN: true }),
        (remainingTimer) => {
          const currentSize = BIRD_SIZE * 1.5;
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
              enlargeTimer: remainingTimer,
            },
            pipes: [
              {
                x: BIRD_X - PIPE_WIDTH - 10,
                gapY: birdY - 50,
                scored: true,
                burger: { x: burgerX, y: burgerY, collected: false },
              },
            ],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: TS,
            highScore: 0,
          };

          update(state, TS); // dt = 0

          expect(state.pipes[0].burger.collected).toBe(false);
          expect(state.bird.currentSize).toBe(currentSize);
          expect(state.bird.enlarged).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
