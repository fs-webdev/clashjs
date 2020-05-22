import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  isActionSafe,
  enemiesInRange,
  calculateDistance,
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

// our custom helper functions
function findNearestCorner(player, gridSize) {
  const { position: [row, column] } = player
  const gotoRow = Math.abs(row - (gridSize - 1)) < row ? gridSize - 1 : 0
  const gotoCol = Math.abs(column - (gridSize - 1)) < column ? gridSize - 1 : 0
  return [gotoRow, gotoCol]
}

function isInCorner(player, gridSize) {
  const { position: [row, column] } = player
  return [0, gridSize - 1].includes(row) && [0, gridSize - 1].includes(column)
}

function getClosestEnemy(player, enemies) {
  const enemyPositions = enemies
    .filter((enemy) => enemy.isAlive)
    .map((enemy) => Object.assign(enemy, { distanceFromPlayer: calculateDistance(player.position, enemy.position)}))
  let closest = enemyPositions[0]
  for (let i = 1; i < enemyPositions.length; ++i) {
    if (enemyPositions[i].distanceFromPlayer < closest.distanceFromPlayer) closest = enemyPositions[i]
  }
  return closest
}

function getClosestTrajectory(player, enemy) {
  const { position: [playerRow, playerColumn] } = player
  const { position: [enemyRow, enemyColumn] } = enemy
  const rowDistance = Math.abs(playerRow - enemyRow)
  const columnDistance = Math.abs(playerColumn - enemyColumn)
  if (rowDistance < columnDistance) {
    return playerColumn === 0 ? 'east' : 'west'
  }
  return playerRow === 0 ? 'south' : 'north'
}

//  function rotateMode(player) {
//    switch (player.direction) {
//      case 'north':
//        return (
//          'east'
//        );
//      case 'east':
//        return (
//            'south'
//        );
//      case 'south':
//        return (
//            'west'
//        );
//      case 'west':
//        return (
//            'north'
//        );
// }
//////////////////////////////

export default {
  info: {
    name: 'nullBot',
    style: 34,
    team: 2,
  },
  ai: function (player, enemies, game) {
    log('Executing my AI function', player, enemies, game)
    console.log(JSON.stringify(player))
    console.log(JSON.stringify(game))
    console.log(JSON.stringify(enemies))
    console.log(getClosestEnemy(player, enemies))

    if (enemies.length > 4) {
      if (player.ammo < 1) {
        const closestAmmo = findClosestAmmo(player, game)

        if (closestAmmo) {
          log('Found some ammo', closestAmmo)
          const ammoDir = calculateHeading(player.position, closestAmmo)

          log('Heading towards ammo', ammoDir)
          if (ammoDir === player.direction) {
            const isSafe = isActionSafe(player, 'move', enemies, game)
            return isSafe ? 'move' : ammoDir
          } else {
            return ammoDir
          }
        }
      }
      return 'shoot'
    }

    const oneEnemyLeft = enemies.filter((enemy) => enemy.isAlive).length === 1

    // Stayin alive, stayin alive...
    if (threatsFacingMe(player, enemies).length > 0) {
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // const targets = enemiesInRange(player, enemies);
    // if (player.ammo > 0 && targets.length > 0) {
    //   log("Found someone to shoot", targets);
    //   return "shoot";
    // }

    if (oneEnemyLeft) {
      // Aggressive strategy
      // How can we improve this over the starter bot? Are there any places where it fails consistently against the beast bot?
      // What does this look like?
      // - Chase enemy EXCEPT if
      //   - Enemy is facing us

      const targets = enemiesInRange(player, enemies)
      if (player.ammo > 0 && targets.length > 0) {
        log('Found someone to shoot', targets)
        return 'shoot'
      }

      // Find target if we have ammo, otherwise look for ammo
      const target = player.ammo < 1 ? findClosestAmmo(player, game) : getClosestEnemy(player, enemies).position

      // NEED TO MAKE SURE THAT WE DON'T GET INTO LINE OF SIGHT WITHOUT AMMO
      if (target) {
        log('Found a target', target)
        const enemyDir = calculateHeading(player.position, target)

        log('Heading towards target', enemyDir)
        let action
        if (enemyDir === player.direction) {

          action = 'move'
          if(isActionSafe(player, action, enemies, game)) {
            return action
          }
        } else {
          action = enemyDir
          if(isActionSafe(player, action, enemies, game)) {
            return action
          }
          return action
        }
      }
      const isSafe = isActionSafe(player, 'move', enemies, game)
      return isSafe ? 'move' : player.direction
    } else {
      // Grab ammo if none is to be had
      if (player.ammo < 1) {
        const closestAmmo = findClosestAmmo(player, game)

        if (closestAmmo) {
          log('Found some ammo', closestAmmo)
          const ammoDir = calculateHeading(player.position, closestAmmo)

          log('Heading towards ammo', ammoDir)
          if (ammoDir === player.direction) {
            const isSafe = isActionSafe(player, 'move', enemies, game)
            return isSafe ? 'move' : ammoDir
          } else {
            return ammoDir
          }
        }
      }

      // If already in corner, face where the nearest bot would come from
      if (isInCorner(player, game.gridSize)) {
        const closestEnemy = getClosestEnemy(player, enemies)
        const trajectory = getClosestTrajectory(player, closestEnemy)
        if (player.ammo > 0 && trajectory === player.direction) {
          const targets = enemiesInRange(player, enemies)
          if (targets.length > 0) {
            log('Found someone to shoot', targets)
            player.ammo--
            return 'shoot'
          }
        }
        return trajectory
      }
      // Run and hide strategy
      // Maybe hide in the corner?
      const corner = findNearestCorner(player, game.gridSize)
      const cornerDir = calculateHeading(player.position, corner)
      if (cornerDir === player.direction) {
        const isSafe = isActionSafe(player, 'move', enemies, game)
        return isSafe ? 'move' : player.direction
      }
      return cornerDir
    }

    // Check if we are in immediate danger, if so try to move
    // if (threatsFacingMe(player, enemies).length > 0) {
    //   log("In danger! Lets try to move");
    //   if (canMoveForward(player, game)) {
    //     return "move";
    //   }
    // }

    // Not in danger, so lets see if we can shoot somebody
    // const targets = enemiesInRange(player, enemies);
    // if (player.ammo > 0 && targets.length > 0) {
    //   log("Found someone to shoot", targets);
    //   return "shoot";
    // }

    // Not in danger, nobody to shoot, lets go collect more ammo
    // const closestAmmo = findClosestAmmo(player, game);

    // if (closestAmmo) {
    //   log("Found some ammo", closestAmmo);
    //   const ammoDir = calculateHeading(player.position, closestAmmo);

    //   log("Heading towards ammo", ammoDir);
    //   if (ammoDir === player.direction) {
    //     return "move";
    //   } else {
    //     return ammoDir;
    //   }
    // }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  },
}
