import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import { BIRD_X, BIRD_SIZE, CANVAS_HEIGHT, PIPE_WIDTH, GAP_SIZE, ENLARGE_DURATION } from '../../src/constants.js';

function makePlaying(overrides = {}) {
  const base = {
    phase: 'PLAYING',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0, enlarged: false, currentSize: BIRD_SIZE, enlargeTimer: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: Number.MAX_SAFE_INTEGER,
    pendingBurger: false,
    lastTimestamp: 0,
    highScore: 0,
  };
  if (overrides.bird) {
    base.bird = { ...base.bird, ...overrides.bird };
    const { bird, ...rest } = overrides;
    return { ...base, ...rest };
  }
  return { ...base, ...overrides };
}

// Feature: mango-the-dove-game, Property 10: Score increments correctly per pipe passed
describe('P10: Score increments correctly per pipe passed', () => {
  it('score increments by 1 when bird passes a pipe while not enlarged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (scoreBefore) => {
          const pipeX = BIRD_X - PIPE_WIDTH - 1;
          const gapY = CANVAS_HEIGHT / 2 - GAP_SIZE / 2;
          const state = makePlaying({
            score: scoreBefore,
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, Number.MAX_SAFE_INTEGER);
          expect(state.score).toBe(scoreBefore + 1);
          expect(state.pipes[0].scored).toBe(true);
        }
      )
    );
  });

  it('score increments by 2 when bird passes a pipe while enlarged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (scoreBefore) => {
          const pipeX = BIRD_X - PIPE_WIDTH - 1;
          const gapY = CANVAS_HEIGHT / 2 - GAP_SIZE / 2;
          const state = makePlaying({
            score: scoreBefore,
            bird: {
              enlarged: true,
              currentSize: BIRD_SIZE * 1.5,
              enlargeTimer: ENLARGE_DURATION,
            },
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, Number.MAX_SAFE_INTEGER);
          expect(state.score).toBe(scoreBefore + 2);
          expect(state.pipes[0].scored).toBe(true);
        }
      )
    );
  });

  it('score does not increment again for an already-scored pipe', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (scoreBefore) => {
          const pipeX = BIRD_X - PIPE_WIDTH - 1;
          const gapY = CANVAS_HEIGHT / 2 - GAP_SIZE / 2;
          const state = makePlaying({
            score: scoreBefore,
            pipes: [{ x: pipeX, gapY, scored: true }],
          });
          update(state, Number.MAX_SAFE_INTEGER);
          expect(state.score).toBe(scoreBefore);
        }
      )
    );
  });
});
