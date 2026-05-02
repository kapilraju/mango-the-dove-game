import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { BIRD_X, BIRD_SIZE } from '../../src/constants.js';

// Stub Image globally before importing render.js (which calls `new Image()` at module level)
// In Node environment, Image is not defined; provide a minimal stub so the module loads.
class ImageStub {
  constructor() {
    this.src = '';
    this.complete = false;
    this.naturalWidth = 0;
  }
}

// Must be set before the dynamic import of render.js
global.Image = ImageStub;

// Dynamically import render after stubbing Image
let render;
beforeAll(async () => {
  const mod = await import('../../src/render.js');
  render = mod.render;
});

function makeMockCtx() {
  const calls = { translate: [], fillRect: [], fillText: [], drawImage: [] };
  return {
    calls,
    clearRect: () => {},
    fillRect: (x, y, w, h) => calls.fillRect.push({ x, y, w, h }),
    fillText: (text, x, y) => calls.fillText.push({ text, x, y }),
    drawImage: (...args) => calls.drawImage.push(args),
    save: () => {},
    restore: () => {},
    translate: (x, y) => calls.translate.push({ x, y }),
    rotate: () => {},
    get fillStyle() { return this._fillStyle; },
    set fillStyle(v) { this._fillStyle = v; },
    get font() { return this._font; },
    set font(v) { this._font = v; },
    get textAlign() { return this._textAlign; },
    set textAlign(v) { this._textAlign = v; },
  };
}

// Feature: mango-the-dove-game, Property 25: Render uses bird.currentSize when drawing the bird
describe('P25: Render uses bird.currentSize when drawing the bird', () => {
  it('bird is drawn with width and height equal to bird.currentSize', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BIRD_SIZE, max: BIRD_SIZE * 8 }),
        (currentSize) => {
          const ctx = makeMockCtx();
          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: 200,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize,
              enlargeTimer: 3,
            },
            pipes: [],
            score: 0,
            highScore: 0,
          };

          render(state, ctx);

          // The bird is drawn after ctx.translate(bird.x + currentSize/2, bird.y + currentSize/2)
          // Since birdImage won't be loaded in test env, the fallback fillRect is called:
          // ctx.fillRect(-currentSize/2, -currentSize/2, currentSize, currentSize)
          // Find a fillRect call with w === currentSize and h === currentSize
          const birdRect = ctx.calls.fillRect.find(
            (r) => r.w === currentSize && r.h === currentSize
          );

          expect(birdRect).toBeDefined();
          expect(birdRect.w).toBe(currentSize);
          expect(birdRect.h).toBe(currentSize);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: mango-the-dove-game, Property 26: Render displays Math.ceil(enlargeTimer) when bird is enlarged
describe('P26: Render displays Math.ceil(enlargeTimer) when bird is enlarged', () => {
  it('HUD text includes Math.ceil(enlargeTimer) when bird is enlarged', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(5), noNaN: true }),
        (enlargeTimer) => {
          const ctx = makeMockCtx();
          const state = {
            phase: 'PLAYING',
            bird: {
              x: BIRD_X,
              y: 200,
              vy: 0,
              rotation: 0,
              enlarged: true,
              currentSize: BIRD_SIZE * 2,
              enlargeTimer,
            },
            pipes: [],
            score: 0,
            highScore: 0,
          };

          render(state, ctx);

          const expectedText = `Big: ${Math.ceil(enlargeTimer)}s`;
          const hudCall = ctx.calls.fillText.find(
            (call) => call.text === expectedText
          );

          expect(hudCall).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
