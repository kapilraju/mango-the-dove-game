export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;
export const GROUND_HEIGHT = 80;
export const BIRD_X = 100;
export const BIRD_SIZE = 30;
export const GRAVITY = 0.5;
export const FLAP_IMPULSE = 9;
export const PIPE_WIDTH = 60;
export const PIPE_SPEED = 3;
export const GAP_SIZE = 150;
export const PIPE_SPAWN_X = 600;
export const PIPE_INTERVAL = 1800;
export const GAP_MIN_Y = 80;

if (PIPE_INTERVAL <= 0) {
  throw new Error(`PIPE_INTERVAL must be greater than 0, got ${PIPE_INTERVAL}`);
}

export const BURGER_SIZE = 30;
export const BURGER_ROLL_TARGET = [2,4,6];  // array — add more values to tune burger spawn frequency
export const ENLARGE_DURATION = 5;
