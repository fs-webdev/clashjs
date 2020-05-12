import {
  calculateDistance,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:jadestriker')

function perpendicularDirection(direction) {
  switch (direction) {
    case 'north':
      return 'east'
    case 'south':
      return 'west'
    case 'west':
      return 'north'
    case 'east':
      return 'south'
    default:
      return undefined
  }
}
// Check if we are in immediate danger, if so try to move
function canMoveSafely(player, game, enemies) {
  return canMoveForward(player, game) && isActionSafe(player, 'move', enemies, game)
}

function findClosestEnemy(playerPosition, enemies) {
  let closestEnemy
  let lastDistance = 999

  enemies.forEach(enemy => {
    const distance = calculateDistance(playerPosition, enemy.position)

    if (distance < lastDistance) {
      lastDistance = distance
      closestEnemy = enemy
    }
  })

  return closestEnemy
}

export default {
  info: {
    name: 'JadeStriker',
    style: 82,
    team: 17
  },
  ai(player, enemies, game) {
    // Threats facing me
    if (threatsFacingMe(player, enemies).length > 0) {
      if (player.ammo > 0 && enemiesInRange(player, enemies) > 0) {
        return 'shoot'
      }
      log('In danger! Lets try to move')
      if (canMoveSafely(player, game, enemies)) return 'move'
      return perpendicularDirection(player.direction)
    }

    // Attacking enemies
    const targets = enemiesInRange(player, enemies)

    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Finding ammo
    if (player.ammo === 0) {
      const closestAmmo = findClosestAmmo(player, game)

      if (closestAmmo) {
        const ammoHeading = calculateHeading(player.position, closestAmmo)

        if (canMoveSafely(player, game, enemies) && ammoHeading === player.direction) {
          return 'move'
        } else {
          return ammoHeading
        }
      }
    } else {
      // move towards enemies not facing us
      const closestEnemy = findClosestEnemy(player.position, enemies)
      const enemyHeading = calculateHeading(player.position, closestEnemy.position)

      if (canMoveSafely(player, game, enemies) && enemyHeading === player.direction) {
        return 'move'
      } else {
        return enemyHeading
      }
    }

    // Pick new direction
    // return perpendicularDirection(player.direction);
  }
}
