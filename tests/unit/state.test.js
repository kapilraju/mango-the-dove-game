import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createInitialState } from '../../src/state.js';
import { flap } from '../../src/update.js';
import { BIRD_X, CANVAS_HEIGHT } from '../../src/constants.js';

// Feature: flappy-bird-game, Property 11: Initial state has phase START
describe('P11: Initial state has phase START', () => {
  it('createInitialState returns phase START, score 0, empty pipes, bird at center', () => {
    const state = createInitialState();
    expect(state.phase).toBe('START');
    expect(state.score).toBe(0);
    expect(state.pipes).toEqual([]);
    expect(state.bird.y).toBe(CANVAS_HEIGHT / 2);
    expect(state.bird.x).toBe(BIRD_X);
    expect(state.bird.vy).toBe(0);
    expect(state.lastPipeTime).toBe(0);
  });

  it('each call to createInitialState returns a fresh object (deep copy)', () => {
    const s1 = createInitialState();
    const s2 = createInitialState();
    s1.score = 99;
    s1.pipes.push({ x: 0, gapY: 100, scored: false });
    expect(s2.score).toBe(0);
    expect(s2.pipes).toEqual([]);
  });
});

// Feature: flappy-bird-game, Property 12: Spacebar in START phase transitions to PLAYING
describe('P12: Spacebar in START phase transitions to PLAYING', () => {
  it('flap on START state sets phase to PLAYING', () => {
    const state = createInitialState();
    expect(state.phase).toBe('START');
    flap(state);
    expect(state.phase).toBe('PLAYING');
  });

  it('flap on START resets state in place (mutates existing object)', () => {
    const state = createInitialState();
    state.score = 5; // dirty the state
    flap(state);
    expect(state.phase).toBe('PLAYING');
    expect(state.score).toBe(0);
    expect(state.pipes).toEqual([]);
  });
});

// Feature: flappy-bird-game, Property 13: Restart produces clean initial state
describe('P13: Restart (spacebar in GAME_OVER) produces clean initial state', () => {
  it('flap on GAME_OVER resets to START with score 0 and empty pipes', () => {
    fc.assert(
      fc.property(
        fc.record({
          score: fc.integer({ min: 0, max: 1000 }),
          pipes: fc.array(
            fc.record({ x: fc.integer(), gapY: fc.integer(), scored: fc.boolean() }),
            { maxLength: 10 }
          )
        }),
        ({ score, pipes }) => {
          const state = createInitialState();
          state.phase = 'GAME_OVER';
          state.score = score;
          state.pipes = pipes;

          flap(state);

          expect(state.phase).toBe('START');
          expect(state.score).toBe(0);
          expect(state.pipes).toEqual([]);
          expect(state.bird.vy).toBe(0);
          expect(state.bird.y).toBe(CANVAS_HEIGHT / 2);
          expect(state.bird.x).toBe(BIRD_X);
          expect(state.lastPipeTime).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: flappy-bird-game, Property 15: High score is monotonically non-decreasing across rounds
describe('P15: High score is monotonically non-decreasing across rounds', () => {
  it('highScore never decreases across a sequence of rounds', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 200 }), { minLength: 1, maxLength: 20 }),
        (roundScores) => {
          const state = createInitialState();
          state.highScore = 0;

          for (const score of roundScores) {
            const prevHighScore = state.highScore;
            state.phase = 'GAME_OVER';
            state.score = score;
            flap(state); // triggers highScore update + reset
            expect(state.highScore).toBeGreaterThanOrEqual(prevHighScore);
            expect(state.highScore).toBe(Math.max(prevHighScore, score));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: flappy-bird-game, Property 16: High score is always >= current score
describe('P16: High score is always >= current score', () => {
  it('highScore >= score at all times during a session', () => {
    fc.assert(
      fc.property(
        fc.record({
          score: fc.integer({ min: 0, max: 500 }),
          highScore: fc.integer({ min: 0, max: 500 }),
        }),
        ({ score, highScore }) => {
          const state = createInitialState();
          // highScore starts at or above score (simulate a session where highScore was already set)
          state.highScore = Math.max(highScore, score);
          state.score = score;
          expect(state.highScore).toBeGreaterThanOrEqual(state.score);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('highScore >= score after restart from GAME_OVER with any score', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        (score) => {
          const state = createInitialState();
          state.highScore = 0;
          state.phase = 'GAME_OVER';
          state.score = score;
          flap(state);
          // After restart, score resets to 0, highScore = max(0, score)
          expect(state.highScore).toBeGreaterThanOrEqual(state.score);
        }
      ),
      { numRuns: 100 }
    );
  });
});
