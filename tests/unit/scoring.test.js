import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import { BIRD_X, BIRD_SIZE, CANVAS_HEIGHT, PIPE_WIDTH, GAP_SIZE } from '../../src/constants.js';

function makePlaying(overrides = {}) {
  return {
    phase: 'PLAYING',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: Number.MAX_SAFE_INTEGER,
    ...overrides,
  };
}

// Feature: flappy-bird-game, Property 10: Score increments exactly once per pipe passed
describe('P10: Score increments exactly once per pipe passed', () => {
  it('score increments by 1 when bird passes a pipe for the first time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        (scoreBefore) => {
          // Place pipe so bird.x > pipe.x + PIPE_WIDTH (bird has passed it)
          // and pipe.scored = false
          const pipeX = BIRD_X - PIPE_WIDTH - 1; // bird is past the pipe
          const gapY = CANVAS_HEIGHT / 2 - GAP_SIZE / 2; // gap centered on bird
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
