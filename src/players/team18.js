import {
  calculateHeading,
  findClosestAmmo,
  canMoveForward,
  enemiesInRange,
  isActionSafe,
  threatsFacingMe
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:team18')

const VERTICAL = 0
const HORIZONTAL = 1

const directionRight = direction => {
  switch (direction) {
    case 'north':
      return 'east'
    case 'east':
      return 'south'
    case 'south':
      return 'west'
    case 'west':
      return 'north'
  }
}
const directionLeft = direction => {
  switch (direction) {
    case 'north':
      return 'west'
    case 'east':
      return 'north'
    case 'south':
      return 'east'
    case 'west':
      return 'south'
  }
}

const isArmedEnemyNearby = (playerPosition, enemies) => {
  log('isArmedEnemyNearby', playerPosition, enemies)
  return (
    enemies.filter(enemy => {
      return (
        enemy.ammo > 0 &&
        (playerPosition[VERTICAL] == enemy.position[VERTICAL] ||
          playerPosition[HORIZONTAL] == enemy.position[HORIZONTAL])
      )
    }).length > 0
  )
}

const isEnemyDangerous = (player, enemies) => {
  return threatsFacingMe(player, enemies).filter(enemy => enemy.ammo > 0).length > 0
}

export default {
  info: {
    name: 'team❶❽',
    style: 9,
    team: 18
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (isEnemyDangerous(player, enemies)) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game) && isActionSafe(player, 'move', enemies, game)) {
        return 'move'
      }
      return Math.random() > 0.5
        ? directionLeft(player.direction)
        : directionRight(player.direction)
    }

    // Can we shoot somebody?
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      log('enemies', enemies)
      return 'shoot'
    }

    if (isArmedEnemyNearby(player.position, enemies)) {
      // Check if there is an enemy visible, and then move away
      return Math.random() > 0.5
        ? directionLeft(player.direction)
        : directionRight(player.direction)
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      if (ammoDir === player.direction) {
        if (isActionSafe(player, 'move', enemies, game)) {
          log('Moving towards ammo', ammoDir)
          return 'move'
        } else {
          log('Not safe to move towards ammo', ammoDir)
        }
      } else {
        log('Turning towards ammo', ammoDir)
        return ammoDir
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return Math.random() > 0.5 ? directionLeft(player.direction) : directionRight(player.direction)
  }
}
