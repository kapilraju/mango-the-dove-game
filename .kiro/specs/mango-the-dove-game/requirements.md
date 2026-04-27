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
