import {
  calculateDistance,
  calculateHeading,
  calculateNewPosition,
  canMoveForward,
  enemiesInRange,
  findClosestAmmo,
  isActionSafe,
  threatsFacingMe,
} from "../lib/helpers";

import debug from "debug";
const log = debug("clashjs:bot:murderbot");
let lastLocation;

const destinationIsSafeToPursue = (destination, player, enemies, game) => {
  let action = calculateHeading(player.position, destination);
  if (action === player.direction) action= "move"

  return isActionSafe(player, action, enemies, game)
  // TODO: Discard ammo options where opponents are closer
}

const listAmmoByProximity = function (player, game) {
  const sortedAmmo = game.ammoPosition
    .map((ammoPos) => ({
      position: ammoPos,
      distance: calculateDistance(player.position, ammoPos),
    }))
    .sort((ammo1, ammo2) => ammo1.distance - ammo2.distance);

  return sortedAmmo
};

const moveOrTurnIntelligently = function (player, action) {
  if (player.direction === action) {
    return 'move';
  } else {
    return action;
  }
}

const findClosestCorner = function (myPosition, game) {
  let NWDistance = calculateDistance(myPosition, [0, 0]);
  let NEDistance = calculateDistance(myPosition, [0, game.gridSize - 1]);
  let SWDistance = calculateDistance(myPosition, [game.gridSize - 1, 0]);
  let SEDistance = calculateDistance(myPosition, [game.gridSize - 1, game.gridSize - 1]);

  switch (Math.min([NWDistance, NEDistance, SWDistance, SEDistance])) {
    case NWDistance:
      if (myPosition[0] > 0) {
        return "north"
      } else if (myPosition[1] > 0) {
        return "west"
      }
      break;
    case NEDistance:
      if (myPosition[0] < game.gridSize - 1) {
        return "north"
      } else if (myPosition[1] < game.gridSize - 1) {
        return "east"
      }
      break;
    case SWDistance:
      return
      break;
    case SEDistance:
      return
      break;
    default:
      break;
  }
  // And then turn to face one of the outward directions
  return false;
}

export default {
  info: {
    name: "murderbot",
    style: 99,
    team: 10,
  },
  ai: function (player, enemies, game) {
    const currentPosition = player.position;
    // log("AI analysis", JSON.stringify(currentPosition), player.ammo)//, enemies, game);

    // Priorities:

    // 1.a: If I am about to die, move!
    const currentThreats = threatsFacingMe(player, enemies);
    if (currentThreats.length > 0) {
      log(`ENEMIES LOCKING ON! ${JSON.stringify(currentThreats)}`);
      if (canMoveForward(player, game)) { // AND NO ENEMY IS DIRECTLY IN FRONT OF ME
        // If we are going to die either way, determine which opponent has the lower score, and give them the kill
        return "move";
      } else {
        // Fire in frustration
        return "fire";
      }
    }
    // 1.b: (nearly identical logic) If I will probably die next turn,

    if (player.ammo === 0) {
      // 2: If I don't have ammo, go get some, if it is close, and doesn't put me in direct danger
      const possibleDestination = findClosestAmmo(player, game);
      // TODO: Debug why this ends up breaking all of our positioning
      // const possibleDestination = listAmmoByProximity(player, game).find((spotToCheck) => {
      //   // log(`looking at: ${JSON.stringify(spotToCheck.position)}`)
      //   if (destinationIsSafeToPursue(spotToCheck.position, player, enemies, game)) {
      //     return true
      //   } else {
      //     return false
      //   }
      // })

      // log(possibleDestination);

      // TODO: Handle if the closest ammo is underneath you

      if (possibleDestination) {
        log(`Location:\t${JSON.stringify(currentPosition)}, facing ${player.direction}`);
        log(`Destination:${JSON.stringify(possibleDestination)}`);
        const heading = calculateHeading(currentPosition, possibleDestination);
        log('Heading:\t', heading);
        if (player.direction === heading) {
          log(`...moving ${heading}`);
          return 'move'
        } else {
          // If you are diagonally distant and facing one of the two correct directions, just move
          if (currentPosition[0] > possibleDestination[0] && currentPosition[1] > possibleDestination[1] && (player.direction === 'north' || player.direction === 'west')) {
            return 'move'
          } else if (currentPosition[0] < possibleDestination[0] && currentPosition[1] < possibleDestination[1] && (player.direction === 'south' || player.direction === 'east')) {
            return 'move'
          } else if (currentPosition[0] < possibleDestination[0] && currentPosition[1] > possibleDestination[1] && (player.direction === 'south' || player.direction === 'west')) {
            return 'move'
          } else if (currentPosition[0] > possibleDestination[0] && currentPosition[1] < possibleDestination[1] && (player.direction === 'north' || player.direction === 'east')) {
            return 'move'
          } else {
            log(`...turn to face ${heading}`);
            return heading
          }
        }
      }
    } else {
      // 3: Decide whether to pursue: a) an opponent, b) a corner, c) moar ammos
      //     a. If there is a target, shoot it, if we will not be in danger by staying in this space
      const targets = enemiesInRange(player, enemies);
      if (targets.length > 0) {
        log('FIRE!');
        return "shoot";
      }

      // Check if an enemy is going to possibly intersect my path
      let potentialNewTarget = enemies.map(enemy => {
        return calculateNewPosition(enemy, game)
      }).filter((enemyPosition) => {
        return enemyPosition[0] === currentPosition[0]
        || enemyPosition[1] === currentPosition[1]
      })
      potentialNewTarget = potentialNewTarget[0]; // because map...

      // Pre-emptively turn the direction needed to be ready to fire if an enemy might cross our sights
      if (potentialNewTarget) {
        let targetDirection = calculateHeading(currentPosition, potentialNewTarget);
        log(`Predicting potential target to the ${targetDirection} (${JSON.stringify(potentialNewTarget)})\n...facing target`);
        return targetDirection;
      } else {
        // Cover existing ammo
        // If we are the only one with ammo, hunt opponents down
      }

      //     b. If there is ammo closer than a corner, get it; or
      //     c. If there is a corner closer than ammo, move to it.

      // 4: Weigh options: Whether available moves would put us in immediate danger
      // 5: Weigh options: which option will be achievable in few moves
      // 6: if no options are gud, stay put, especially if we're in a corner and have gud ammo

    }

    // Or pursue a stalemate

    // Strategy -- If have ammo, move to closest corner. If no/low ammo, get
    // closest ammo and move to closest corner. Check for nearest threat.
    // Turn and fire. Continue.

    // Pick up easy ammo
    // TODO: Check other players' distance to ammo in question

    // Nothing else to do...claim a corner and wait
    findClosestCorner(player.position, game);
    // turnTowardTarget();
    // enterDuelingMode();
  },
};
