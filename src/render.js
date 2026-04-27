import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  BIRD_SIZE,
  PIPE_WIDTH,
  GAP_SIZE,
} from './constants.js';

const birdImage = new Image();
birdImage.src = 'assets/bird.png';

export function render(state, ctx) {
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

  // Ground
  ctx.fillStyle = '#c8a96e';
  ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

  // Ceiling line
  ctx.fillStyle = '#5aab8f';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 4);

  // Bird
  const { bird } = state;
  ctx.save();
  ctx.translate(bird.x + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2);
  ctx.rotate(bird.rotation);
  if (birdImage.complete && birdImage.naturalWidth > 0) {
    ctx.drawImage(birdImage, -BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
  } else {
    // Fallback while image loads
    ctx.fillStyle = '#f5d800';
    ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
  }
  ctx.restore();

  // Score during PLAYING
  if (state.phase === 'PLAYING') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${state.score}`, CANVAS_WIDTH / 2, 48);
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
    ctx.fillText('Tap or press SPACE to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
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
    ctx.fillText('Tap or press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }
}
