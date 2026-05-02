# Requirements Document

## Introduction

A Flappy Bird-style browser game where the player controls a bird that continuously moves forward. The player taps the space bar to make the bird flap upward, while gravity constantly pulls it downward. The goal is to navigate the bird through gaps in pipes for as long as possible without hitting the ground, ceiling, or pipes.

## Glossary

- **Game**: The overall Flappy Bird-style application running in the browser
- **Bird**: The player-controlled character that moves continuously to the right and is affected by gravity
- **Pipe**: A vertical obstacle with a gap that the Bird must fly through
- **Gap**: The open space between the top and bottom sections of a Pipe pair
- **Ground**: The bottom boundary of the game area; contact causes the Bird to die
- **Ceiling**: The top boundary of the game area
- **Score**: The count of Pipe pairs the Bird has successfully passed through
- **Flap**: The upward impulse applied to the Bird when the player presses the space bar or taps the screen
- **Gravity**: The constant downward acceleration applied to the Bird each game tick
- **Game_Over_Screen**: The UI displayed when the Bird dies
- **Start_Screen**: The UI displayed before the game begins
- **Touch_Input**: A finger tap or touch gesture on a touchscreen device
- **Burger**: A collectible item that may be attached to a Pipe and collected by the Bird to trigger a size-doubling power-up
- **Burger_Roll**: The random determination (1–6) made each time the Bird passes a Pipe, which decides whether a Burger is attached to the next Pipe. The roll is skipped entirely while the Bird is in the Enlarged_State.
- **Enlarge_Timer**: The 5-second countdown tracking how many seconds remain in the Enlarged_State. The timer is not reset by further Burger collection while already enlarged.
- **Debug_Mode**: A developer testing mode activated by appending `?debug` to the page URL, which enables an on-screen overlay showing internal game variables
- **Debug_Overlay**: The on-screen panel rendered in Debug_Mode displaying the current `BURGER_ROLL_TARGET` array and the most recent Burger_Roll value

## Requirements

### Requirement 1: Bird Movement

**User Story:** As a player, I want the bird to move forward automatically and respond to gravity, so that the game presents a continuous challenge.

#### Acceptance Criteria

1. THE Bird SHALL move horizontally to the right at a constant speed throughout gameplay.
2. WHILE the game is running, THE Bird SHALL accelerate downward at a constant rate due to Gravity each game tick.
3. WHEN the player presses the space bar, THE Bird SHALL receive an upward velocity impulse (Flap).
4. WHILE the game is running, THE Bird SHALL have its vertical position updated each game tick based on its current vertical velocity.

---

### Requirement 2: Collision Detection and Death

**User Story:** As a player, I want the game to end when the bird hits an obstacle or the ground, so that there is a meaningful challenge and consequence.

#### Acceptance Criteria

1. WHEN the Bird contacts the Ground, THE Game SHALL transition to the Game_Over_Screen.
2. WHEN the Bird contacts a Pipe, THE Game SHALL transition to the Game_Over_Screen.
3. WHEN the Bird reaches the Ceiling, THE Game SHALL prevent the Bird from moving above the Ceiling boundary.

---

### Requirement 3: Pipe Obstacles

**User Story:** As a player, I want pipes to appear as obstacles, so that I have something to navigate through.

#### Acceptance Criteria

1. THE Game SHALL spawn Pipe pairs at regular horizontal intervals during gameplay.
2. THE Game SHALL position each Pipe pair's Gap at a randomized vertical position within a playable range.
3. WHILE the game is running, THE Game SHALL move all Pipes horizontally toward the Bird at a constant speed.
4. WHEN a Pipe moves beyond the left edge of the game area, THE Game SHALL remove that Pipe from the game.

---

### Requirement 4: Scoring

**User Story:** As a player, I want to earn points for passing through pipes, so that I have a goal to work toward.

#### Acceptance Criteria

1. WHEN the Bird successfully passes through a Pipe pair's Gap, THE Game SHALL increment the Score by 1.
2. THE Game SHALL display the current Score visibly on screen during gameplay.
3. WHEN the Game_Over_Screen is displayed, THE Game SHALL show the final Score achieved in that round.

---

### Requirement 5: Game States

**User Story:** As a player, I want clear start and game-over screens, so that I can begin and restart the game easily.

#### Acceptance Criteria

1. THE Game SHALL display the Start_Screen when first loaded, before gameplay begins.
2. WHEN the player presses the space bar on the Start_Screen, THE Game SHALL begin gameplay.
3. WHEN the Game_Over_Screen is displayed, THE Game SHALL provide an option to restart the game.
4. WHEN the player selects restart on the Game_Over_Screen, THE Game SHALL reset all game state and return to the Start_Screen.

---

### Requirement 7: Touch Input Support

**User Story:** As a mobile player, I want to tap the screen to control the bird, so that I can play the game on a touchscreen device without a keyboard.

#### Acceptance Criteria

1. WHEN the player taps the screen during the PLAYING phase, THE Game SHALL apply a Flap to the Bird (equivalent to pressing the space bar).
2. WHEN the player taps the screen on the Start_Screen, THE Game SHALL begin gameplay (equivalent to pressing the space bar).
3. WHEN the player taps the screen on the Game_Over_Screen, THE Game SHALL restart the game (equivalent to pressing the space bar).
4. WHEN a Touch_Input event is received during gameplay, THE Input_Handler SHALL call preventDefault() on the touch event to suppress default browser behaviors such as scrolling and zooming.
5. THE Input_Handler SHALL handle Touch_Input on iOS Safari and Android Chrome browsers deployed via GitHub Pages.

---

### Requirement 6: Rendering

**User Story:** As a player, I want smooth visual feedback, so that the game feels responsive and enjoyable.

#### Acceptance Criteria

1. THE Game SHALL render at a consistent frame rate using the browser's requestAnimationFrame API.
2. THE Game SHALL visually represent the Bird, Pipes, Ground, Score, and game boundaries on a canvas element.
3. WHEN the Bird performs a Flap, THE Game SHALL visually rotate the Bird upward to indicate the flap direction.
4. WHILE the Bird is falling, THE Game SHALL visually rotate the Bird downward to indicate the fall direction.

---

### Requirement 8: Burger Collectible Spawning

**User Story:** As a player, I want burgers to occasionally appear on pipes, so that I have a chance to collect a power-up that changes the challenge.

#### Acceptance Criteria

1. WHEN the Bird successfully passes through a Pipe pair's Gap AND the Bird is NOT in the Enlarged_State, THE Game SHALL perform a Burger_Roll by generating a random integer uniformly distributed in the range [1, 6].
2. WHEN the Burger_Roll result is contained in the `BURGER_ROLL_TARGET` array, THE Game SHALL attach a Burger to the next Pipe that spawns after the roll.
3. WHEN a Burger is attached to a Pipe, THE Game SHALL position the Burger horizontally centered on that Pipe and vertically within the bottom half of that Pipe's Gap (between the Gap midpoint and the bottom of the Gap, inclusive).
4. WHEN the Burger_Roll result is not contained in the `BURGER_ROLL_TARGET` array, THE Game SHALL NOT attach a Burger to the next Pipe.
5. THE Game SHALL allow at most one Burger to be attached to any single Pipe pair at a time.
6. WHILE the Bird is in the Enlarged_State, THE Game SHALL skip the Burger_Roll entirely when the Bird passes a Pipe.

---

### Requirement 11: Debug Overlay

**User Story:** As a developer, I want to see internal game variables on screen when I pass a debug flag in the URL, so that I can tune and verify the burger mechanic without modifying source code.

#### Acceptance Criteria

1. WHEN the page URL contains the query parameter `debug` (e.g., `?debug` or `?debug=true`), THE Game SHALL activate Debug_Mode for the duration of that page session.
2. WHILE Debug_Mode is active and the game phase is PLAYING, THE Game SHALL render the Debug_Overlay in the bottom-right corner of the canvas.
3. THE Debug_Overlay SHALL display the current value of `BURGER_ROLL_TARGET` (the full array, e.g., `[2]`) on one line.
4. THE Debug_Overlay SHALL display the most recent Burger_Roll result (the last integer rolled when the bird passed a pipe) on a second line.
5. WHEN no Burger_Roll has yet occurred in the current session, THE Debug_Overlay SHALL display `—` as the roll value placeholder.
6. THE Debug_Mode flag SHALL be determined once at page load from `window.location.search` and SHALL NOT require a page reload to take effect during a session.

---

### Requirement 9: Burger Collection and Bird Enlargement

**User Story:** As a player, I want collecting a burger to increase my bird's size, so that gameplay becomes harder and more exciting.

#### Acceptance Criteria

1. WHEN the Bird's bounding box overlaps a Burger's bounding box AND the Bird is NOT in the Enlarged_State, THE Game SHALL remove the Burger from the game and transition the Bird into the Enlarged_State.
2. WHEN the Bird enters the Enlarged_State, THE Game SHALL set the Bird's rendered and collision size to `BIRD_SIZE × 1.5` and start the Enlarge_Timer at 5 seconds.
3. WHEN the Enlarge_Timer reaches 0 seconds, THE Game SHALL transition the Bird out of the Enlarged_State and restore the Bird's rendered and collision size to BIRD_SIZE.
4. WHILE the Bird is in the Enlarged_State and the Bird's bounding box overlaps a Burger's bounding box, THE Game SHALL have no effect — the Burger SHALL remain in play and the Bird's size and timer SHALL NOT change.
5. WHILE the Bird is in the Enlarged_State, THE Game SHALL use the enlarged collision size for all pipe and ground collision detection.
6. WHEN the Bird transitions out of the Enlarged_State, THE Game SHALL restore the Bird's collision size to BIRD_SIZE.

---

### Requirement 10: Burger Rendering and Visual Feedback

**User Story:** As a player, I want to clearly see burgers on pipes and know when my bird is enlarged, so that I can make informed decisions during gameplay.

#### Acceptance Criteria

1. WHILE a Burger is attached to a Pipe and the Pipe is on screen, THE Game SHALL render the Burger sprite (assets/burger.png) at the Burger's position on the canvas.
2. WHILE the Bird is in the Enlarged_State, THE Game SHALL render the Bird sprite at the enlarged size (BIRD_SIZE × 2 per active doubling) to visually reflect the current collision size.
3. WHEN a Burger image asset fails to load, THE Game SHALL render a fallback colored rectangle at the Burger's position so the Burger remains visible and collectible.
4. WHILE the Bird is in the Enlarged_State, THE Game SHALL display the remaining Enlarge_Timer duration (in whole seconds) on screen so the player can see how long the enlargement lasts.
