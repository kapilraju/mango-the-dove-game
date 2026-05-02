import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import {
  BIRD_X, BIRD_SIZE, CANVAS_HEIGHT, GROUND_HEIGHT, GAP_SIZE, PIPE_WIDTH
} from '../../src/constants.js';

// Use dt = 0 for collision tests so physics don't move the bird
const TS = 5000;

function makePlaying(overrides = {}) {
  const base = {
    phase: 'PLAYING',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0, currentSize: BIRD_SIZE, enlarged: false, enlargeTimer: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: Number.MAX_SAFE_INTEGER,
    pendingBurger: false,
    lastTimestamp: TS, // same as timestamp → dt = 0
    highScore: 0,
  };
  if (overrides.bird) {
    base.bird = { ...base.bird, ...overrides.bird };
    const { bird, ...rest } = overrides;
    return { ...base, ...rest };
  }
  return { ...base, ...overrides };
}

// Feature: mango-the-dove-game, Property 4: Any collision transitions to GAME_OVER
describe('P4: Any collision transitions to GAME_OVER', () => {
  it('ground collision: bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT → GAME_OVER', () => {
    fc.assert(
      fc.property(
        fc.float({ min: CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE, max: CANVAS_HEIGHT, noNaN: true }),
        (y) => {
          const groundThreshold = CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
          const state = makePlaying({ bird: { x: BIRD_X, y: groundThreshold, vy: 0, rotation: 0 } });
          update(state, TS);
          expect(state.phase).toBe('GAME_OVER');
        }
      )
    );
  });

  it('pipe collision: bird overlapping top pipe section → GAME_OVER', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 50, max: 300, noNaN: true }),
        (gapY) => {
          const pipeX = BIRD_X - PIPE_WIDTH / 2;
          const birdY = gapY - BIRD_SIZE - 1;
          if (birdY < 0) return;
          const state = makePlaying({
            bird: { x: BIRD_X, y: birdY, vy: 0, rotation: 0 },
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, TS);
          expect(state.phase).toBe('GAME_OVER');
        }
      )
    );
  });

  it('pipe collision: bird overlapping bottom pipe section → GAME_OVER', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 50, max: 200, noNaN: true }),
        (gapY) => {
          const pipeX = BIRD_X - PIPE_WIDTH / 2;
          const birdY = gapY + GAP_SIZE + 1;
          if (birdY + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT) return;
          const state = makePlaying({
            bird: { x: BIRD_X, y: birdY, vy: 0, rotation: 0 },
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, TS);
          expect(state.phase).toBe('GAME_OVER');
        }
      )
    );
  });
});

// Feature: mango-the-dove-game, Property 24: Enlarged collision size applies to ground and pipe detection
describe('P24: Enlarged collision size applies to ground and pipe detection', () => {
  it('sub-test 1: enlarged bird hits ground when normal bird would not', () => {
    const currentSize = BIRD_SIZE * 1.5;
    const safeForBase = CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE - 1;
    const state = {
      phase: 'PLAYING',
      bird: {
        x: BIRD_X,
        y: safeForBase,
        vy: 0,
        rotation: 0,
        enlarged: true,
        currentSize,
        enlargeTimer: 5,
      },
      pipes: [],
      score: 0,
      lastPipeTime: Number.MAX_SAFE_INTEGER,
      pendingBurger: false,
      lastTimestamp: TS,
      highScore: 0,
    };
    update(state, TS);
    expect(state.phase).toBe('GAME_OVER');
  });

  it('sub-test 2: enlarged bird hits pipe when normal bird would not', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 200 }),
        (gapY) => {
          const currentSize = BIRD_SIZE * 1.5;
          const birdY = gapY + GAP_SIZE - BIRD_SIZE;
          if (birdY + currentSize >= CANVAS_HEIGHT - GROUND_HEIGHT) return;
          const pipeX = BIRD_X - PIPE_WIDTH / 2;
          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: birdY,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize,
              enlargeTimer: 5,
            },
            pipes: [{ x: pipeX, gapY, scored: true, burger: null }],
            score: 0,
            lastPipeTime: Number.MAX_SAFE_INTEGER,
            pendingBurger: false,
            lastTimestamp: TS,
            highScore: 0,
          };
          update(state, TS);
          expect(state.phase).toBe('GAME_OVER');
        }
      ),
      { numRuns: 100 }
    );
  });
});
