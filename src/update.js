import { GRAVITY, BIRD_X, BIRD_SIZE, FLAP_IMPULSE, PIPE_SPAWN_X, PIPE_INTERVAL, GAP_MIN_Y, CANVAS_HEIGHT, GROUND_HEIGHT, GAP_SIZE, PIPE_SPEED, PIPE_WIDTH, BURGER_ROLL_TARGET, BURGER_SIZE, ENLARGE_DURATION } from './constants.js';
import { createInitialState } from './state.js';
import { trackGameStart, trackGameOver, trackBurgerCollected, trackRestart } from './analytics.js';

export function update(state, timestamp) {
  if (state.phase !== 'PLAYING') return;

  // Compute deltaTime in seconds since last frame
  const deltaTime = state.lastTimestamp > 0 ? (timestamp - state.lastTimestamp) / 1000 : 0;
  state.lastTimestamp = timestamp;

  // Cap deltaTime to avoid spiral-of-death on tab switch or debugger pause
  const dt = Math.min(deltaTime, 0.05);

  const bird = state.bird;

  // Enlarge timer countdown — decrement before burger collection check
  if (bird.enlarged) {
    bird.enlargeTimer -= dt;
    if (bird.enlargeTimer <= 0) {
      bird.enlarged = false;
      bird.currentSize = BIRD_SIZE;
      bird.enlargeTimer = 0;
    }
  }

  // Apply gravity (semi-implicit Euler: update velocity first, then position)
  bird.vy += GRAVITY * dt;
  bird.y += bird.vy * dt;

  // Clamp to ceiling
  if (bird.y < 0) {
    bird.y = 0;
    bird.vy = 0;
  }

  // Keep bird.x fixed
  bird.x = BIRD_X;

  // Derive rotation from vy, clamped between -30° and +90°
  // Scale vy to a visual range: divide by 600 (≈ FLAP_IMPULSE) to get similar feel to old 0.1 * vy
  bird.rotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 2, bird.vy / 600));

  // Spawn new pipe when interval has elapsed
  if (timestamp - state.lastPipeTime >= PIPE_INTERVAL) {
    const gapY = GAP_MIN_Y + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - 2 * GAP_MIN_Y);
    const pipe = { x: PIPE_SPAWN_X, gapY, scored: false, burger: null };
    if (state.pendingBurger) {
      const burgerX = pipe.x + PIPE_WIDTH / 2 - BURGER_SIZE / 2;
      const gapMid = gapY + GAP_SIZE / 2;
      const burgerY = gapMid + Math.random() * (GAP_SIZE / 2 - BURGER_SIZE);
      pipe.burger = { x: burgerX, y: burgerY, collected: false };
      state.pendingBurger = false;
    }
    state.pipes.push(pipe);
    state.lastPipeTime = timestamp;
  }

  // Move all pipes left and remove off-screen pipes
  const pipeMove = PIPE_SPEED * dt;
  for (const pipe of state.pipes) {
    pipe.x -= pipeMove;
    // Move burger with its pipe
    if (pipe.burger && !pipe.burger.collected) {
      pipe.burger.x -= pipeMove;
    }
  }
  state.pipes = state.pipes.filter(pipe => pipe.x + PIPE_WIDTH >= 0);

  // Burger collection — check AABB overlap between bird and each pipe's burger
  for (const pipe of state.pipes) {
    if (!pipe.burger || pipe.burger.collected === true) continue;
    const birdRight = bird.x + bird.currentSize;
    const birdBottom = bird.y + bird.currentSize;
    const burgerRight = pipe.burger.x + BURGER_SIZE;
    const burgerBottom = pipe.burger.y + BURGER_SIZE;
    const overlaps = bird.x < burgerRight && birdRight > pipe.burger.x && bird.y < burgerBottom && birdBottom > pipe.burger.y;
    if (overlaps) {
      // While enlarged, burgers have no effect — burger stays in play
      if (bird.enlarged) continue;
      pipe.burger.collected = true;
      bird.enlarged = true;
      bird.currentSize = BIRD_SIZE * 1.5;
      bird.enlargeTimer = ENLARGE_DURATION;
      trackBurgerCollected();
    }
  }

  // Scoring — increment score when bird passes a pipe for the first time
  for (const pipe of state.pipes) {
    if (bird.x > pipe.x + PIPE_WIDTH && pipe.scored === false) {
      state.score += bird.enlarged ? 2 : 1;
      pipe.scored = true;
      // Burger_Roll: skip entirely while bird is enlarged (no new burgers during inflation)
      if (!bird.enlarged) {
        const roll = Math.floor(Math.random() * 6) + 1;
        state.lastRoll = roll;
        if (BURGER_ROLL_TARGET.includes(roll)) { state.pendingBurger = true; }
      }
    }
  }

  // Collision detection — ground
  if (bird.y + bird.currentSize >= CANVAS_HEIGHT - GROUND_HEIGHT) {
    state.phase = 'GAME_OVER';
    trackGameOver(state.score, state.highScore ?? 0);
    return;
  }

  // Collision detection — pipes
  for (const pipe of state.pipes) {
    const horizontalOverlap = bird.x + bird.currentSize > pipe.x && bird.x < pipe.x + PIPE_WIDTH;
    if (horizontalOverlap) {
      const inTopPipe = bird.y < pipe.gapY;
      const inBottomPipe = bird.y + bird.currentSize > pipe.gapY + GAP_SIZE;
      if (inTopPipe || inBottomPipe) {
        state.phase = 'GAME_OVER';
        trackGameOver(state.score, state.highScore ?? 0);
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
    trackGameStart();
  } else if (state.phase === 'GAME_OVER') {
    const highScore = Math.max(state.highScore ?? 0, state.score);
    Object.assign(state, createInitialState());
    state.highScore = highScore;
    trackRestart();
  }
}
