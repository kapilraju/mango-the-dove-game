# Implementation Plan: Mango The Dove

## Overview

Implement a browser-based Mango The Dove game using vanilla JavaScript and the HTML5 Canvas API. The game follows a state/update/render architecture with no build tooling required.

## Tasks

- [x] 1. Set up project structure and constants
  - Create `index.html` with a canvas element and script tag loading `game.js` as an ES module
  - Create `src/constants.js` exporting all game constants (CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT, BIRD_X, BIRD_SIZE, GRAVITY, FLAP_IMPULSE, PIPE_WIDTH, PIPE_SPEED, GAP_SIZE, PIPE_SPAWN_X, PIPE_INTERVAL, GAP_MIN_Y)
  - Add a guard in constants.js that throws if PIPE_INTERVAL <= 0
  - _Requirements: 1.1, 3.1, 6.1_

- [x] 2. Implement game state model
  - [x] 2.1 Create `src/state.js` with `createInitialState()` returning the full initial state shape
    - phase: 'START', bird at center, pipes: [], score: 0, lastPipeTime: 0
    - _Requirements: 5.1_

  - [ ]* 2.2 Write property test for initial state invariants
    - **Property 11: Initial state has phase START**
    - **Validates: Requirements 5.1**

- [x] 3. Implement input handling
  - [x] 3.1 Create `src/input.js` that listens for keydown spacebar and calls a provided callback
    - Export an `initInput(onSpacebar)` function
    - _Requirements: 1.3, 5.2_

- [x] 4. Implement physics and update logic
  - [x] 4.1 Create `src/update.js` with a `update(state, timestamp)` function
    - Apply gravity: `bird.vy += GRAVITY`, `bird.y += bird.vy` each tick
    - Clamp bird.y to 0 at ceiling (never negative)
    - Keep bird.x fixed at BIRD_X
    - _Requirements: 1.1, 1.2, 1.4, 2.3_

  - [ ]* 4.2 Write property test for bird horizontal invariant
    - **Property 1: Bird horizontal position is invariant**
    - **Validates: Requirements 1.1**

  - [ ]* 4.3 Write property test for physics tick
    - **Property 2: Physics tick correctly updates velocity and position**
    - **Validates: Requirements 1.2, 1.4**

  - [ ]* 4.4 Write property test for ceiling clamp
    - **Property 5: Bird is clamped at ceiling**
    - **Validates: Requirements 2.3**

  - [x] 4.5 Implement flap action in update.js
    - When flap is triggered, set `bird.vy = -FLAP_IMPULSE`
    - _Requirements: 1.3_

  - [ ]* 4.6 Write property test for flap impulse
    - **Property 3: Flap sets velocity to upward impulse**
    - **Validates: Requirements 1.3**

  - [x] 4.7 Implement bird rotation derived from vy
    - Derive `bird.rotation` from `bird.vy`, clamped between -30° and +90° (in radians)
    - _Requirements: 6.3, 6.4_

  - [ ]* 4.8 Write property test for bird rotation
    - **Property 14: Bird rotation reflects vertical velocity**
    - **Validates: Requirements 6.3, 6.4**

- [x] 5. Implement pipe spawning and movement
  - [x] 5.1 Add pipe spawning logic to `update.js`
    - Spawn a new pipe when `timestamp - lastPipeTime >= PIPE_INTERVAL`
    - Randomize gapY using `GAP_MIN_Y + Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - 2 * GAP_MIN_Y)`
    - Update lastPipeTime on spawn
    - _Requirements: 3.1, 3.2_

  - [ ]* 5.2 Write property test for pipe spawn interval
    - **Property 6: Pipes spawn after interval elapses**
    - **Validates: Requirements 3.1**

  - [ ]* 5.3 Write property test for pipe gap range
    - **Property 7: All pipe gaps are within the playable vertical range**
    - **Validates: Requirements 3.2**

  - [x] 5.4 Add pipe movement and removal to `update.js`
    - Each tick: `pipe.x -= PIPE_SPEED` for all pipes
    - Remove pipes where `pipe.x + PIPE_WIDTH < 0`
    - _Requirements: 3.3, 3.4_

  - [ ]* 5.5 Write property test for pipe movement
    - **Property 8: Pipes move left by PIPE_SPEED each tick**
    - **Validates: Requirements 3.3**

  - [ ]* 5.6 Write property test for off-screen pipe removal
    - **Property 9: Off-screen pipes are removed**
    - **Validates: Requirements 3.4**

- [x] 6. Implement collision detection and scoring
  - [x] 6.1 Add collision detection to `update.js`
    - Detect bird hitting ground (bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT)
    - Detect bird overlapping any pipe bounding box
    - Transition phase to 'GAME_OVER' on collision
    - _Requirements: 2.1, 2.2_

  - [ ]* 6.2 Write property test for collision transitions
    - **Property 4: Any collision transitions to GAME_OVER**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 6.3 Add scoring logic to `update.js`
    - When bird.x > pipe.x + PIPE_WIDTH and pipe.scored === false, increment score and set pipe.scored = true
    - _Requirements: 4.1_

  - [ ]* 6.4 Write property test for score increment
    - **Property 10: Score increments exactly once per pipe passed**
    - **Validates: Requirements 4.1**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement state machine transitions
  - [x] 8.1 Wire state transitions in `update.js` and `input.js`
    - START + spacebar → reset state via createInitialState(), set phase to PLAYING
    - GAME_OVER + spacebar → call createInitialState(), return to START
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ]* 8.2 Write property test for START → PLAYING transition
    - **Property 12: Spacebar in START phase transitions to PLAYING**
    - **Validates: Requirements 5.2**

  - [ ]* 8.3 Write property test for restart producing clean state
    - **Property 13: Restart produces clean initial state**
    - **Validates: Requirements 5.4**

- [x] 9. Implement the game loop
  - Create `src/loop.js` with a `startLoop(state, update, render)` function using requestAnimationFrame
  - Store the rAF handle so it can be cancelled on reset to prevent multiple concurrent loops
  - Call update(state, timestamp) then render(state) each frame
  - _Requirements: 6.1_

- [x] 10. Implement rendering
  - [x] 10.1 Create `src/render.js` with a `render(state, ctx)` function
    - Draw ground, ceiling boundaries, and background
    - Draw all pipes (top and bottom sections with gap)
    - Draw bird with rotation applied via canvas transform
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 10.2 Render score and game state screens
    - Draw current score on screen during PLAYING phase
    - Draw Start_Screen when phase === 'START'
    - Draw Game_Over_Screen with final score and restart prompt when phase === 'GAME_OVER'
    - _Requirements: 4.2, 4.3, 5.1, 5.3_

- [x] 11. Wire everything together in game.js
  - Create `src/game.js` as the entry point
  - Initialize canvas, get 2d context; display fallback message if context is null
  - Call createInitialState(), initInput(), startLoop() to connect all modules
  - Pass flap callback through input → update so spacebar triggers the correct action per game phase
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement high score tracking and display
  - [x] 13.1 Add `highScore` to game state in `game.js`
    - Initialize `highScore: 0` in `game.js` alongside the initial state (not inside `createInitialState()`)
    - Before each restart, update `state.highScore = Math.max(state.highScore, state.score)` then carry it over after `Object.assign(state, createInitialState())`
    - _Requirements: 4.4, 4.5_

  - [x] 13.2 Update `flap()` in `update.js` to preserve high score on restart
    - When transitioning from GAME_OVER → START, save `highScore` before reset and restore it after
    - _Requirements: 4.4, 4.5_

  - [x] 13.3 Render high score persistently on the right side of the canvas
    - In `render.js`, always draw "Best: N" right-aligned near the top-right corner, regardless of game phase
    - _Requirements: 4.6_

  - [ ]* 13.4 Write property test for high score monotonically non-decreasing
    - **Property 15: High score is monotonically non-decreasing across rounds**
    - **Validates: Requirements 4.4, 4.5**

  - [ ]* 13.5 Write property test for high score >= current score
    - **Property 16: High score is always >= current score**
    - **Validates: Requirements 4.5**

  - [x] 13.6 Checkpoint — Ensure all tests pass
    - Run `npx vitest --run` and confirm all tests pass

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Test files live in `tests/unit/` — physics.test.js, pipes.test.js, collision.test.js, scoring.test.js, state.test.js
- Run tests with `npx vitest --run` after installing `vitest` and `fast-check`
- Each property test must include a comment: `// Feature: mango-the-dove-game, Property N: <property text>`
- The game requires no build step — open index.html directly in a browser (or via a local static server for ES modules)
