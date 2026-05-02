import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';
import { createInitialState } from './state.js';
import { initInput } from './input.js';
import { update, flap } from './update.js';
import { render } from './render.js';
import { startLoop } from './loop.js';

// Detect debug mode once at page load — activate with ?debug in the URL
const DEBUG = new URLSearchParams(window.location.search).has('debug');

const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const ctx = canvas.getContext('2d');
if (!ctx) {
  canvas.insertAdjacentHTML('afterend', '<p>Canvas 2D context is not supported in your browser.</p>');
} else {
  const state = createInitialState();
  state.highScore = 0;
  initInput(() => flap(state), canvas);
  const boundRender = (state) => render(state, ctx, DEBUG);
  startLoop(state, update, boundRender);
}
