import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  BIRD_SIZE,
  PIPE_WIDTH,
  GAP_SIZE,
  BURGER_SIZE,
  BURGER_ROLL_TARGET,
} from './constants.js';

const birdImage = new Image();
birdImage.src = 'assets/bird.png';

const burgerImage = new Image();
burgerImage.src = 'assets/burger.png';

export function render(state, ctx, debug = false) {
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Sky background
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Pipes
  ctx.fillStyle = '#74bf2e';
  for (const pipe of state.pipes) {
    // Top section: from y=0 down to gapY
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
    // Bottom section: from gapY + GAP_SIZE down to ground
    const bottomY = pipe.gapY + GAP_SIZE;
    ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT - bottomY);
  }

  // Burgers
  for (const pipe of state.pipes) {
    if (pipe.burger !== null && !pipe.burger.collected) {
      if (burgerImage.complete && burgerImage.naturalWidth > 0) {
        ctx.drawImage(burgerImage, pipe.burger.x, pipe.burger.y, BURGER_SIZE, BURGER_SIZE);
      } else {
        ctx.fillStyle = '#c8640a';
        ctx.fillRect(pipe.burger.x, pipe.burger.y, BURGER_SIZE, BURGER_SIZE);
      }
    }
  }

  // Ground
  ctx.fillStyle = '#c8a96e';
  ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

  // Ceiling line
  ctx.fillStyle = '#5aab8f';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 4);

  // Bird
  const { bird } = state;
  ctx.save();
  ctx.translate(bird.x + bird.currentSize / 2, bird.y + bird.currentSize / 2);
  ctx.rotate(bird.rotation);
  if (birdImage.complete && birdImage.naturalWidth > 0) {
    ctx.drawImage(birdImage, -bird.currentSize / 2, -bird.currentSize / 2, bird.currentSize, bird.currentSize);
  } else {
    // Fallback while image loads
    ctx.fillStyle = '#f5d800';
    ctx.fillRect(-bird.currentSize / 2, -bird.currentSize / 2, bird.currentSize, bird.currentSize);
  }
  ctx.restore();

  // Score during PLAYING
  if (state.phase === 'PLAYING') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, 48);

    // Enlarge timer HUD
    if (state.bird.enlarged) {
      ctx.fillStyle = '#ff8800';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Big: ${Math.ceil(state.bird.enlargeTimer)}s`, 12, 48);
    }
  }

  // High score — always visible in top-right corner
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Best: ${state.highScore ?? 0}`, CANVAS_WIDTH - 12, 36);

  // Start screen
  if (state.phase === 'START') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Mango The Dove', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.font = '24px sans-serif';
    ctx.fillText('Tap screen or press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  }

  // Game over screen
  if (state.phase === 'GAME_OVER') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    ctx.font = '28px sans-serif';
    ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = '22px sans-serif';
    ctx.fillText('Tap screen or press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }

  // Debug overlay — visible only when ?debug is in the URL and game is PLAYING
  if (debug && state.phase === 'PLAYING') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(CANVAS_WIDTH - 160, CANVAS_HEIGHT - 60, 155, 52);
    ctx.fillStyle = '#00ff99';
    ctx.font = '13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`target: ${JSON.stringify(BURGER_ROLL_TARGET)}`, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 42);
    ctx.fillText(`roll:   ${state.lastRoll ?? '\u2014'}`, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 24);
  }
}
