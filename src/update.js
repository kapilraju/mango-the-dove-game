import { GRAVITY, BIRD_X, BIRD_SIZE, FLAP_IMPULSE, PIPE_SPAWN_X, PIPE_INTERVAL, GAP_MIN_Y, CANVAS_HEIGHT, GROUND_HEIGHT, GAP_SIZE, PIPE_SPEED, PIPE_WIDTH } from './constants.js';
import { createInitialState } from './state.js';

export function update(state, timestamp) {
  if (state.phase !== 'PLAYING') return;

  const bird = state.bird;

  // Apply gravity
  bird.vy += GRAVITY;
  bird.y += bird.vy;

  // Clamp to ceiling
  if (bird.y < 0) {
    bird.y = 0;
    bird.vy = 0;
  }

  // Keep bird.x fixed
  bird.x = BIRD_X;

  // Derive rotation from vy, clamped between -30° and +90°
  bird.rotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 2, bird.vy * 0.1));

  // Spawn new pipe when interval has elapsed
  if (timestamp - state.lastPipeTime >= PIPE_INTERVAL) {
    const gapY = GAP_MIN_Y + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - 2 * GAP_MIN_Y);
    state.pipes.push({ x: PIPE_SPAWN_X, gapY, scored: false });
    state.lastPipeTime = timestamp;
  }

  // Move all pipes left and remove off-screen pipes
  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED;
  }
  state.pipes = state.pipes.filter(pipe => pipe.x + PIPE_WIDTH >= 0);

  // Scoring — increment score when bird passes a pipe for the first time
  for (const pipe of state.pipes) {
    if (bird.x > pipe.x + PIPE_WIDTH && pipe.scored === false) {
      state.score += 1;
      pipe.scored = true;
    }
  }

  // Collision detection — ground
  if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT) {
    state.phase = 'GAME_OVER';
    return;
  }

  // Collision detection — pipes
  for (const pipe of state.pipes) {
    const horizontalOverlap = bird.x + BIRD_SIZE > pipe.x && bird.x < pipe.x + PIPE_WIDTH;
    if (horizontalOverlap) {
      const inTopPipe = bird.y < pipe.gapY;
      const inBottomPipe = bird.y + BIRD_SIZE > pipe.gapY + GAP_SIZE;
      if (inTopPipe || inBottomPipe) {
        state.phase = 'GAME_OVER';
        return;
      }
    }
  }
}

export function flap(state) {
  if (state.phase === 'PLAYING') {
    state.bird.vy = -FLAP_IMPULSE;
  } else if (state.phase === 'START') {
    const highScore = state.highScore ?? 0;
    Object.assign(state, createInitialState());
    state.highScore = highScore;
    state.phase = 'PLAYING';
  } else if (state.phase === 'GAME_OVER') {
    const highScore = Math.max(state.highScore ?? 0, state.score);
    Object.assign(state, createInitialState());
    state.highScore = highScore;
  }
}
