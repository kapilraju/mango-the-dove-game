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

- [x] 14. Implement touch input support for mobile
  - [x] 14.1 Add `touchstart` event listener to `src/input.js`
    - Inside `initInput(onSpacebar)`, add `window.addEventListener('touchstart', (event) => { event.preventDefault(); onSpacebar(); }, { passive: false })`
    - The `passive: false` option is required to allow `preventDefault()` to suppress scrolling/zooming on iOS Safari and Android Chrome
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15. Add burger power-up constants
  - Add `BURGER_SIZE`, `BURGER_ROLL_TARGET`, and `ENLARGE_DURATION` to `src/constants.js`
    - `BURGER_SIZE = 30` — width and height of burger sprite/hitbox
    - `BURGER_ROLL_TARGET = 2` — the roll value that triggers a burger spawn
    - `ENLARGE_DURATION = 5` — seconds the Enlarged_State lasts
  - _Requirements: 8.1, 8.2, 9.2_

- [x] 16. Update state model for burger mechanic
  - [x] 16.1 Update `createInitialState()` in `src/state.js` to include burger-related fields
    - Add `bird.enlarged: false`, `bird.currentSize: BIRD_SIZE`, `bird.enlargeTimer: 0`
    - Add `pendingBurger: false` at the top level of state
    - Import `BIRD_SIZE` from `./constants.js`
    - _Requirements: 9.1, 9.2, 8.2_

  - [ ]* 16.2 Update property test for initial state invariants
    - Update `tests/unit/state.test.js` Property 11 test to also assert `bird.enlarged === false`, `bird.currentSize === BIRD_SIZE`, `bird.enlargeTimer === 0`, and `pendingBurger === false`
    - **Property 11: Initial state has phase START**
    - **Validates: Requirements 5.1**

- [x] 17. Implement burger roll and pendingBurger flag
  - In `src/update.js`, after the scoring block (where `pipe.scored` is set to `true`), perform the Burger_Roll:
    - `const roll = Math.floor(Math.random() * 6) + 1;`
    - `if (roll === BURGER_ROLL_TARGET) { state.pendingBurger = true; }`
  - Import `BURGER_ROLL_TARGET` from `./constants.js`
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 18. Implement burger spawning on next pipe
  - In `src/update.js` pipe spawn logic (inside the `if (timestamp - state.lastPipeTime >= PIPE_INTERVAL)` block), after pushing the new pipe, check `state.pendingBurger`:
    - Compute `burgerX = pipe.x + PIPE_WIDTH / 2 - BURGER_SIZE / 2` (horizontally centered on pipe)
    - Compute `gapMid = gapY + GAP_SIZE / 2`
    - Compute `burgerY = gapMid + Math.random() * (GAP_SIZE / 2 - BURGER_SIZE)` (bottom half of gap)
    - Attach `pipe.burger = { x: burgerX, y: burgerY, collected: false }`
    - Set `state.pendingBurger = false`
    - When `state.pendingBurger === false`, set `pipe.burger = null` on the new pipe
  - Import `BURGER_SIZE` from `./constants.js`
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 19. Implement burger collection and bird enlargement
  - In `src/update.js`, each tick after pipe movement, iterate over `state.pipes` and check AABB overlap between the bird's bounding box (using `bird.currentSize`) and each pipe's burger:
    - Skip if `pipe.burger === null` or `pipe.burger.collected === true`
    - Compute overlap: `bird.x < burgerRight && birdRight > pipe.burger.x && bird.y < burgerBottom && birdBottom > pipe.burger.y`
    - On overlap: if `bird.enlarged`, skip (burger stays in play, no effect)
    - Else: set `pipe.burger.collected = true`, `bird.enlarged = true`, `bird.currentSize = BIRD_SIZE * 1.5`, `bird.enlargeTimer = ENLARGE_DURATION`
  - Import `ENLARGE_DURATION` from `./constants.js`
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 20. Implement enlarge timer countdown
  - In `src/update.js`, compute `deltaTime` from the `timestamp` parameter (seconds since last frame; use a stored `state.lastTimestamp` or derive from the loop)
  - Each tick, if `bird.enlarged === true`, decrement `bird.enlargeTimer -= deltaTime`
  - When `bird.enlargeTimer <= 0`: set `bird.enlarged = false`, `bird.currentSize = BIRD_SIZE`, `bird.enlargeTimer = 0`
  - _Requirements: 9.3, 9.6_

- [x] 21. Update collision detection to use bird.currentSize
  - In `src/update.js`, replace all uses of `BIRD_SIZE` in collision checks with `bird.currentSize`:
    - Ground collision: `bird.y + bird.currentSize >= CANVAS_HEIGHT - GROUND_HEIGHT`
    - Pipe horizontal overlap: `bird.x + bird.currentSize > pipe.x && bird.x < pipe.x + PIPE_WIDTH`
    - Pipe vertical overlap: `bird.y + bird.currentSize > pipe.gapY + GAP_SIZE` (bottom pipe) and `bird.y < pipe.gapY` (top pipe)
  - _Requirements: 9.5_

- [x] 22. Implement burger rendering
  - In `src/render.js`, after drawing pipes, iterate over `state.pipes` and for each pipe where `pipe.burger !== null && !pipe.burger.collected`:
    - If `burgerImage.complete && burgerImage.naturalWidth > 0`: call `ctx.drawImage(burgerImage, pipe.burger.x, pipe.burger.y, BURGER_SIZE, BURGER_SIZE)`
    - Else: draw a fallback colored rectangle (`ctx.fillStyle = '#c8640a'`, `ctx.fillRect(pipe.burger.x, pipe.burger.y, BURGER_SIZE, BURGER_SIZE)`)
  - Add `const burgerImage = new Image(); burgerImage.src = 'assets/burger.png';` at the top of the file
  - Import `BURGER_SIZE` from `./constants.js`
  - _Requirements: 10.1, 10.3_

- [x] 23. Update bird rendering to use bird.currentSize
  - In `src/render.js`, replace all uses of `BIRD_SIZE` in the bird drawing block with `bird.currentSize`:
    - `ctx.translate(bird.x + bird.currentSize / 2, bird.y + bird.currentSize / 2)`
    - `ctx.drawImage(birdImage, -bird.currentSize / 2, -bird.currentSize / 2, bird.currentSize, bird.currentSize)`
    - Fallback rect: `ctx.fillRect(-bird.currentSize / 2, -bird.currentSize / 2, bird.currentSize, bird.currentSize)`
  - _Requirements: 10.2_

- [x] 24. Implement enlarge timer HUD
  - In `src/render.js`, after drawing the score, add a block: if `state.bird.enlarged`, draw `"Big: ${Math.ceil(state.bird.enlargeTimer)}s"` on screen
    - Use a distinct style (e.g., `ctx.fillStyle = '#ff8800'`, `ctx.font = 'bold 24px sans-serif'`, `ctx.textAlign = 'left'`)
    - Position near the top-left (e.g., `ctx.fillText(...)` at `x=12, y=48`)
  - _Requirements: 10.4_

- [x] 25. Verify burger state resets on restart
  - Confirm that `createInitialState()` (updated in task 16.1) already resets `pendingBurger=false`, `bird.enlarged=false`, `bird.currentSize=BIRD_SIZE`, `bird.enlargeTimer=0`
  - Verify the `flap()` function in `src/update.js` calls `createInitialState()` on both START→PLAYING and GAME_OVER→START transitions, so burger state is always clean after restart
  - No code changes needed if task 16.1 is complete; this is a verification step
  - _Requirements: 5.4, 9.1_

- [x] 26. Checkpoint — Ensure all tests pass
  - Run `npx vitest --run` and confirm all existing tests still pass before adding new property tests
  - Ask the user if any questions arise.

- [x] 27. Write property tests for burger mechanic
  - [ ]* 27.1 Write property test for burger roll range (P17)
    - In `tests/unit/burger.test.js`, call the roll function 1000 times and assert every result is an integer in [1, 6]
    - **Property 17: Burger roll always produces an integer in [1, 6]**
    - **Validates: Requirements 8.1**

  - [ ]* 27.2 Write property test for burger collection entering Enlarged_State (P21)
    - Use `fc.record(...)` for overlapping bird/burger positions where bird is not enlarged
    - Assert: `burger.collected === true`, `bird.enlarged === true`, `bird.currentSize === BIRD_SIZE * 1.5`, `bird.enlargeTimer === ENLARGE_DURATION`
    - **Property 21: Collecting a burger enters Enlarged_State with correct initial values**
    - **Validates: Requirements 9.1, 9.2**

  - [ ]* 27.3 Write property test for timer expiry restoring base size (P22)
    - Use `fc.float({min:0.001,max:5})` for initial enlargeTimer
    - Assert: after timer reaches 0, `bird.enlarged === false`, `bird.currentSize === BIRD_SIZE`, `bird.enlargeTimer === 0`
    - **Property 22: Timer expiry restores bird to base size**
    - **Validates: Requirements 9.3, 9.6**

  - [ ]* 27.4 Write property test for collecting burger while enlarged has no effect (P23)
    - Use `fc.record(...)` for enlarged bird state overlapping a burger
    - Assert: after update, burger is NOT collected, `bird.currentSize` unchanged, `bird.enlargeTimer` unchanged
    - **Property 23: Collecting a burger while enlarged has no effect**
    - **Validates: Requirements 9.4**

- [x] 28. Write property tests for burger pipe spawning
  - [ ]* 28.1 Write property test for burger spawning iff pendingBurger is true (P18)
    - Update `tests/unit/pipes.test.js` with `fc.boolean()` for pendingBurger and `fc.record(...)` for pipe spawn state
    - Assert: if `pendingBurger === true` → new pipe has `burger !== null` and `pendingBurger` resets to `false`; if `pendingBurger === false` → new pipe has `burger === null`
    - **Property 18: Burger spawns on next pipe if and only if pendingBurger is true**
    - **Validates: Requirements 8.2, 8.4**

  - [ ]* 28.2 Write property test for burger position centered on pipe and in bottom half of gap (P19)
    - Use `fc.integer(...)` for gapY within valid range
    - Assert: `burger.x + BURGER_SIZE / 2 === pipe.x + PIPE_WIDTH / 2` and `pipe.gapY + GAP_SIZE / 2 <= burger.y` and `burger.y + BURGER_SIZE <= pipe.gapY + GAP_SIZE`
    - **Property 19: Burger position is centered on pipe and in the bottom half of the gap**
    - **Validates: Requirements 8.3**

  - [ ]* 28.3 Write property test for at most one burger per pipe pair (P20)
    - Use `fc.array(...)` of pipe states after N updates
    - Assert: every pipe has `burger` as either `null` or a single object — never multiple burgers
    - **Property 20: At most one burger per pipe pair at any time**
    - **Validates: Requirements 8.5**

- [x] 29. Write property test for enlarged collision detection
  - [ ]* 29.1 Write property test for enlarged collision size applying to ground/pipe detection (P24)
    - Update `tests/unit/collision.test.js` with `fc.record(...)` for bird positions near boundaries using `currentSize`
    - Assert: a bird position safe at `BIRD_SIZE` but unsafe at `currentSize` still triggers `GAME_OVER`
    - **Property 24: Enlarged collision size applies to ground and pipe detection**
    - **Validates: Requirements 9.5**

- [x] 30. Write property tests for burger rendering
  - [ ]* 30.1 Write property test for render using bird.currentSize when drawing bird (P25)
    - Create `tests/unit/render.test.js` with a mock canvas context
    - Use `fc.integer({min: BIRD_SIZE, max: BIRD_SIZE * 8})` for `currentSize`
    - Assert: the bird is drawn with width and height equal to `bird.currentSize`, not `BIRD_SIZE`
    - **Property 25: Render uses bird.currentSize when drawing the bird**
    - **Validates: Requirements 10.2**

  - [ ]* 30.2 Write property test for render displaying Math.ceil(enlargeTimer) when enlarged (P26)
    - Use `fc.float({min: 0.001, max: 5})` for `enlargeTimer`
    - Assert: the HUD text includes `Math.ceil(enlargeTimer)` as the displayed value
    - **Property 26: Render displays Math.ceil(enlargeTimer) when bird is enlarged**
    - **Validates: Requirements 10.4**

- [x] 31. Final checkpoint — Ensure all tests pass
  - Run `npx vitest --run` and confirm all tests pass (existing and new)
  - Ask the user if any questions arise.

- [x] 32. Change BURGER_ROLL_TARGET from a number to an array
  - In `src/constants.js`, change `export const BURGER_ROLL_TARGET = 2;` to `export const BURGER_ROLL_TARGET = [2, 4, 6];`
  - In `src/update.js`, change the roll check from `roll === BURGER_ROLL_TARGET` to `BURGER_ROLL_TARGET.includes(roll)`
  - Store the roll result in `state.lastRoll` each time a roll is performed: `state.lastRoll = roll;`
  - In `src/state.js`, add `lastRoll: null` to `createInitialState()` so it resets to `null` on restart
  - _Requirements: 8.2, 8.4_

- [x] 33. Implement debug overlay
  - In `src/game.js`, detect the debug flag once at load: `const DEBUG = new URLSearchParams(window.location.search).has('debug');`
  - Pass `DEBUG` into the render call (update `startLoop` / `render` signature, or export `DEBUG` from `game.js` and import it in `render.js`)
  - In `src/render.js`, when `DEBUG === true` and `state.phase === 'PLAYING'`, draw the debug overlay in the bottom-right corner:
    - Semi-transparent background rect: `rgba(0,0,0,0.55)` at `(CANVAS_WIDTH - 160, CANVAS_HEIGHT - 60, 155, 52)`
    - Line 1: `` `target: ${JSON.stringify(BURGER_ROLL_TARGET)}` `` right-aligned at `(CANVAS_WIDTH - 8, CANVAS_HEIGHT - 42)`
    - Line 2: `` `roll:   ${state.lastRoll ?? '—'}` `` right-aligned at `(CANVAS_WIDTH - 8, CANVAS_HEIGHT - 24)`
    - Use `ctx.font = '13px monospace'`, `ctx.fillStyle = '#00ff99'`, `ctx.textAlign = 'right'`
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 34. Final checkpoint — Ensure all tests pass
  - Run `npx vitest --run` and confirm all tests pass
  - Ask the user if any questions arise.

- [x] 35. Implement double scoring while enlarged
  - In `src/update.js`, change `state.score += 1` to `state.score += bird.enlarged ? 2 : 1` in the scoring block
  - Update `tests/unit/scoring.test.js` to test both +1 (normal) and +2 (enlarged) scoring
  - Update Property 10 in design.md to reflect the new scoring rule
  - Add acceptance criteria 4.1 and 4.2 to requirements.md Requirement 4
  - _Requirements: 4.1, 4.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Test files live in `tests/unit/` — physics.test.js, pipes.test.js, collision.test.js, scoring.test.js, state.test.js
- Run tests with `npx vitest --run` after installing `vitest` and `fast-check`
- Each property test must include a comment: `// Feature: mango-the-dove-game, Property N: <property text>`
- The game requires no build step — open index.html directly in a browser (or via a local static server for ES modules)
