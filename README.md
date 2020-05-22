# [ClashJS](http://javierbyte.github.io/clashjs/)

[![](spec_assets/screenshot.jpg)](http://javierbyte.github.io/clashjs/)

[Demo Online](https://master.d2s799bbd4jz1m.amplifyapp.com/)

This is an experiment. The idea is to create a battle game, where the participants code their AI, and then we make them fight! You can play by adding your own AI to the game!

# How to run the demo.

Clone the repo and then

```sh
npm install
npm start
```

Then go to `http://localhost:3000`.

# How to participate.

Add your player as specified in the [player definition](#player-definition) below in this README.

Make a copy of `/src/players/starterbot.js` and rename it to whatever your team wants to call it.

```
/src/players/myteambot.js
```

And then require yourself in

```
/src/players.js
```

Change the `info.name` property to whatever you want (but stay about 20 characters max, emojis are okay).
Change the `info.team` property to the team number assigned to your team
[Optional] Set the `info.style` property to the number of the rocket/spaceship style that you like. You can see all 110 styles in the game by clicking the Rocket icon. The style number is **above** the rocket/spaceship.

**Note**: If you do not provide a name or a style, the game will randomly assign you a name and a rocket/spaceship style.

Now run the app again. Have fun!

Read the [game definitions](#game-definitions) to learn how to create your player. Have fun!

When you are done coding your bot (or the time runs out), create a PR to the `fs-webdev/clashjs` repo with your bot code and the `src/players.js` file including your bot. **Make sure you PR to the correct `fs-webdev` fork of this project, Github sometimes assigns your PR to another fork by default, so doublecheck.**

# Game. Functional Spec.

## Introduction.

Games and coding are fun! So I want to make a game where we can confront AI vs AI in javascript.

The game is simple: we will put all the players in a battle arena, and then make them fight to death. Where will be ammo in the arena so they can shoot each other. The last player alive wins!

### Game Rules.

- Every player will have a position and direction on the grid. A player can not go over the grid limits, and can only face north, east, south or west.
- The game will be turn based. Every turn we will execute the AI function of every alive player passing as arguments:
  - The state of the player.
  - The state of all other players.
  - A environment configuration option with:
    - Grid size.
    - The position of the ammo.
- Every turn a player must execute some of the following actions:
  - Move one step in its current direction. (`move`).
  - Turn into any of the four directions. (`north`, `east`, `south`, `west`).
  - Shoot. (`shoot`).
- A player can shoot to try to destroy another player. If you send `shoot` and don't have ammo, it will no-op and waste your turn. Shooting impacts every enemy in front of you. If an enemy is on your same square, they will not be shot. But every enemy ahead of you for the entire remaining row or column will be killed in the direction you are facing.
- A player can collect ammo in the moment it enters the square containing the ammo. New ammo may appear in any moment of the game. If ammo appears on your square, you will not collect it unless you move off and back on.

**Note**: Please do not try and hack or break the game. There are ways to cheat and modify the game state or other players (not through the objects given to your `ai` function, but other means). We will try to review the bots as you PR them in, but please just stay within the rules.

**Note**: We also ask that your team do all of your own coding. We have given you a basic starter bot and a helpers library with various helper functions. Please do not go find code from other bots and copy them into your bot code.

## Running/Debugging

A game consists of several rounds. When a round completes, another round immediately starts. Once all of the rounds are complete, the game is over and the stats modal appears with the winner and final stats. To play another game, you have to reload the browser tab.

By default the game starts at 200ms delay so you can watch the action, then gradually increases to 50ms. If you change the speed slider or use a keyboard shortcut, this is overridden and whatever you set will stick for the rest of the game.

The pinkish spikeballs are the ammo.

Winners are decided by number of rounds won, tiebreakers are first number of kills, then number of ammo collected.

Sounds are off by default, you can enable them with the buttons in the game, but be warned they can be loud so check your volume first.

There is icon to display the stats modal, you can show that at any time and it live updates as the game plays.

There is a rocket icon which shows all of the 110 rocket/spaceship styles that are available.

There are 3 bots provided in the game: `randombot`, `starterbot`, and `beasty` (in `/src/players/`, plus your copy of `starterbot` that you will modify. Beasty is a more advanced bot and we have obfuscated the code. You can learn from it's behavior by observing it play, but please don't copy or go looking for the source to put into your bot. Do all of your own coding and logic/strategy. You can add/remove bots from the game by commenting them in and out in `/src/players.js`. Do not modify the code of any of the existing bots, just your bot.

When running the game, there are some tools to help you debug your bot and it's data. We have provided the [`debug`](https://www.npmjs.com/package/debug) library and a namespace of `clashjs:bot:`. You can enable logging in your bot and some basic game logging by enabling this namespace by typing this command into the dev tools console:

```
localStorage.debug='clashjs:bot:*'
```

To turn off debugging:

```
localStorage.debug=''
```

There is also a debug panel that displays on the left side of the screen with json of the player states that you can toggle with the `d` key. This also turns bot names red when they have ammo and shows how much ammo they have.

### Keyboard shortcuts

Pause/Resume the game: `spacebar`

Show/hide the debug panel and info: `d`

Speed controls:

- `0` - 0ms delay -- fastest speed
- `1` - 100ms delay
- `2` - 200ms delay
- `9` - 1000ms delay -- slowest speed

Sounds/Music:

- `s` - toggle sounds on/off
- `m` - toggle music soundtrack on/off

## Game Definitions.

### Player Definition.

Let the _player definition_ (`playerDefinition`) be an object with the player info and its AI function.

```js
{
  info: {
    name: 'starterbot',
    style: 20, // one of the 112 styles (0 to 112) available. Click the Rocket icon in game for a catalog of all of the styles
    team: 1, // team number assigned to your team
  },
  ai: function(player, enemies, game) {
    // think...
    return 'move'; // or some other action
  }
}
```

The AI function will receive [`player`](#player-state), `enemies` (array of all the other players `playerState`s), and [`game`](#game-environment) as arguments, and must return one of the following strings:

- `move`: To move one tile in the current direction.
- `north`, `east`, `south` or `west`: To turn to that direction.
- `shoot`. To shoot if the user has enough ammo.

Any other response, trying to move outside the arena size (`game.gridSize`) or trying to shoot without ammo, will result in a no-op and your turn is skipped. If you throw an exception in your `ai` function your turn will be skipped.

All positions in the game are in a 2 item array: `[verticalOffset, horizontalOffset]` from upper left corner, zero indexed, so essentially `[Y, X]` except in the 4th quadrant so Y increases as you go down the board.

### Player State.

The _player state_ (`player`) is an object containing the following information:

```js
{
  position: `[<number>, <number>]`,
  direction: `<string>`, // One of 'north', 'east', 'south' or 'west'
  ammo: `<number>`,
  isAlive: `<bool>`
}
```

### Game Environment.

Let the _game environment_ (`gameEnvironment`) be a configuration object like the following:

```js
{
  gridSize: [<number>, <number>],
  ammoPosition: <array of [<number>, <number>] arrays>
}
```

### Game State.

Let the _game state_ (`gameState`) be an object with the array of all user states, and the game environment.

```js
{
  playerStates: <array of `playerStates`>,
  gameEnvironment: <`gameEnvironment`>
}
```

# Game Technical Spec.

## Problem.

We should make an app that can take functions provided by the users, execute them, and render the game as specified in the functional spec.

## Constraints.

- Just. The game mechanics should avoid to accidentally benefit players by its random nature. The order of execution of the AIs should not benefit any player. The position of the newly create coins should try to be as just for everyone.
- Be safe. A player code should not be able to modify anything other than itself.
- Be resilient as possible. If a player crashes or stop responding, the show must go on.

## How this was made.

### Architecture.

We can divide the problem in 3 big steps.

- **AI Runner**. This will take all the user provided functions and the current game state, and execute every function.
  - This will take care of catch errors on the functions, and stop non-responding functions to hang the window.
- **Game Core**. This will take the responses that the AI Runners sends, and apply the game logic on them.
  - Kill killed players.
  - Move and turn players.
  - Set the results of a shot and kill
  - Count if too many inactive turns had passed.
  - Stop the game when it ends.
- **Render**. This will take the game state and render it nicely.

They will interact as follows:

![](spec_assets/game-blackbox.png)

<!---
sequenceDiagram
AI Runner->> Game Core: Array of objects
Note left of Game Core: The AI runners sends <br/> the results of <br/>executing the code <br/> of every player<br/>on the current game<br/>state.
Game Core->> Render: Game state
Note left of Render: The core applies the<br/>results to the game,<br/>computes the new<br/>state, and sends<br/>it to the render.
Note left of Game Core: The Core sends the<br/>new game state to<br/>the AI runner<br/>to execute all<br/>functions again.
Game Core->>AI Runner: Game State

http://knsv.github.io/mermaid/live_editor/
-->

# AI Runner. Spec.

## Problem.

The AI runner should execute all the functions that the players provided, with the current user state, all user states, and game enrivonment as arguments.

## Constraints.

- Prevent the user functions to modify anything except itself.
- Catch executions errors, and simply return `null` as response to the Game Core.
- Detect if any functions gets stuck in an infinite loop, and return `null` as response.

## Hypothesis.

In the future, we could run the functions as WebWorkers because:

- They can not access the dom and modify things.
- Runs in a sandbox. If they crash or stop responding we can detect it.
- Bonus: We can parallelise the excecution.

The game is designed to make irrelevant the order of execution of the AIs. So we are safe running all this asynchronous.

## Solution.

To prevent the functions to take so much time thinking (probably because an infinite loop), we will create an array of `null`s, where we will put the responses of the workers as they arrive. If `X` seconds passes (enough time to think for almost everything, except infinite loops, of couse) then we will pass the `null`ified response of that worker, and the Game Core will kill that player.

![](spec_assets/airunner-blackbox.png)

<!---
sequenceDiagram
Game Core->> AI Runner: Game State
Note left of AI Runner: Starts a countdown<br/>of X seconds.
AI Runner->> Worker0: Arguments
AI Runner->> Worker1: Arguments
Worker1->> AI Runner: Response
AI Runner->> Worker2: Arguments
Worker0->> AI Runner: Response
Worker2->> AI Runner: Response
Note left of AI Runner: When all the workers<br/>responds, or the<br/>countdown hits 0<br/>return the values<br/>to the Game Core.
AI Runner->> Game Core: Results

http://knsv.github.io/mermaid/live_editor/
-->

# Game Core.

## Player Class.

This javascript class will recive a `playerDefinition` and return a player instance.

### Arguments:

- [`playerDefinition`](#player-definition).
- [`evtCallback`] A callback that will receive the arguments `evt` and `data`.

### Methods:

- `getInfo`. Will return the player info.
- `execute`. Will receive the following arguments:
  - [`playerState`](#player-state). The current player state.
  - `enemiesStates`. An array all the other live players `playerState`s.
  - [`gameEnvironment`](#game-environment). The game environment object.

## ClashJS Class.

This class will receive all the player definitions, generate the game states, and execute the players AIs.

### Arguments:

- `playerDefinitionArray`. An array of [`playerDefinition`](#player-definition) objects.

### Methods:

- `getState`. Will return the current [`gameState`](#game-state).
- `nextStep`. Will execute a step for every player (all individual plys). Will return the game state.
- `nextPly`. Will execute the AI for the player in turn. Will return the game state.

# Render.

React.
