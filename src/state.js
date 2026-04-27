import { BIRD_X, CANVAS_HEIGHT } from './constants.js';

export function createInitialState() {
  return {
    phase: 'START',
    bird: { x: BIRD_X, y: CANVAS_HEIGHT / 2, vy: 0, rotation: 0 },
    pipes: [],
    score: 0,
    lastPipeTime: 0
  };
}
