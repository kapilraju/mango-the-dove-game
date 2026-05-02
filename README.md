# Mango The Dove

> This project was built using [Kiro](https://kiro.dev), an AI-powered IDE, following a spec-driven development workflow. The full spec (requirements, design, and tasks) lives in `.kiro/specs/`.

## Play Now

🕹️ **[Click here to play Mango The Dove](https://kapilraju.github.io/mango-the-dove-game/)**

## Gameplay

![Mango The Dove gameplay screenshot](assets/screenshot.png)

A browser-based game where you guide a dove through pipe gaps. Built with vanilla JavaScript and the HTML5 Canvas API. No build step required.

## Running the Game

Because the game uses ES modules, you need to serve it over HTTP rather than opening `index.html` directly as a `file://` URL.

Any static file server works. A few quick options:

**Node (via npx):**
```bash
npx serve .
```

**Python:**
```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or whatever port is shown) in your browser.

## How to Play

- Press **Space** on the start screen to begin
- Press **Space** to flap — each press gives the bird an upward boost
- Gravity pulls the bird down continuously, so keep tapping to stay airborne
- Fly through the gaps between pipes to score points
- Hitting a pipe, the ground, or letting the bird fall off-screen ends the game
- Press **Space** on the game over screen to restart

### Burger Power-up

Occasionally a burger appears in the lower half of a pipe gap. Collecting it doubles the bird's size for 5 seconds, making it harder to fit through gaps. Collecting another burger while already enlarged doubles the size again and resets the timer. The bird returns to its original size when the timer expires.

## Debug Mode

Append `?debug` to the URL to enable the debug overlay:

```
http://localhost:8080/?debug
```

While the game is running, a small panel appears in the **bottom-right corner** of the canvas showing:

| Field | Description |
|-------|-------------|
| `target` | The current `BURGER_ROLL_TARGET` array — the roll values that trigger a burger spawn |
| `roll` | The most recent dice roll result (1–6); shows `—` before the first pipe is passed |

This is useful for tuning burger spawn frequency. To make burgers spawn more often, add more values to `BURGER_ROLL_TARGET` in `src/constants.js`:

```js
// Default — burger spawns on a roll of 2 (1-in-6 chance)
export const BURGER_ROLL_TARGET = [2];

// More frequent — burger spawns on 2 or 5 (2-in-6 chance)
export const BURGER_ROLL_TARGET = [2, 5];
```

## Running Tests

Install dependencies first:
```bash
npm install
```

Then run the test suite:
```bash
npm test
```

Tests use [Vitest](https://vitest.dev/) and [fast-check](https://github.com/dubzzz/fast-check) for property-based testing. All tests run in a single pass with no watch mode.

## Project Structure

```
index.html          # Entry point — canvas element
src/
  constants.js      # All game constants (canvas size, physics, pipe config, BURGER_ROLL_TARGET)
  state.js          # createInitialState() — the game state shape
  update.js         # Physics, pipe logic, collision, scoring, burger roll, state transitions
  input.js          # Keyboard and touch input handler
  loop.js           # requestAnimationFrame game loop
  render.js         # Canvas drawing (background, pipes, bird, UI screens, debug overlay)
  game.js           # Wires everything together; detects ?debug flag
assets/
  bird.png          # Bird sprite
  burger.png        # Burger collectible sprite
tests/
  unit/
    physics.test.js
    pipes.test.js
    collision.test.js
    scoring.test.js
    state.test.js
    loop.test.js
    input.test.js
    burger.test.js  # Burger mechanic property tests (P17, P21–P23)
    render.test.js  # Render property tests (P25, P26)
```
