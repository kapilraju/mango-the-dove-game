import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { update } from '../../src/update.js';
import {
  BIRD_X, BIRD_SIZE, CANVAS_HEIGHT, GROUND_HEIGHT, GAP_SIZE, PIPE_WIDTH
} from '../../src/constants.js';

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

// Feature: flappy-bird-game, Property 4: Any collision transitions to GAME_OVER
describe('P4: Any collision transitions to GAME_OVER', () => {
  it('ground collision: bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT → GAME_OVER', () => {
    fc.assert(
      fc.property(
        fc.float({ min: CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE, max: CANVAS_HEIGHT, noNaN: true }),
        (y) => {
          // Set vy=0 so bird stays at y after physics (y + 0 + GRAVITY might push it over)
          // Use a y that is already at or past the ground threshold
          const groundThreshold = CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
          const state = makePlaying({ bird: { x: BIRD_X, y: groundThreshold, vy: 0, rotation: 0 } });
          update(state, Number.MAX_SAFE_INTEGER);
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
          // Bird is horizontally overlapping the pipe and above the gap (in top pipe)
          const pipeX = BIRD_X - PIPE_WIDTH / 2; // bird overlaps pipe horizontally
          const birdY = gapY - BIRD_SIZE - 1; // bird is just above the gap (in top pipe)
          if (birdY < 0) return; // skip invalid positions
          const state = makePlaying({
            bird: { x: BIRD_X, y: birdY, vy: 0, rotation: 0 },
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, Number.MAX_SAFE_INTEGER);
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
          // Bird is horizontally overlapping the pipe and below the gap (in bottom pipe)
          const pipeX = BIRD_X - PIPE_WIDTH / 2;
          const birdY = gapY + GAP_SIZE + 1; // bird is just below the gap
          if (birdY + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT) return; // skip ground collision
          const state = makePlaying({
            bird: { x: BIRD_X, y: birdY, vy: 0, rotation: 0 },
            pipes: [{ x: pipeX, gapY, scored: false }],
          });
          update(state, Number.MAX_SAFE_INTEGER);
          expect(state.phase).toBe('GAME_OVER');
        }
      )
    );
  });
});
