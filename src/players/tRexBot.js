import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  enemiesInRange,
  isActionSafe,
  calculateDistance,
  threats
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

// Helper function
const findClosestEnemy = function(player, enemies) {
  log('### ammo, player, game', player, enemies)
  const sortedEnemies = enemies
    .map(enemy => ({
      position: enemy.position,
      distance: calculateDistance(player.position, enemy.position)
    }))
    .sort((enemy1, enemy2) => enemy1.distance - enemy2.distance)

  return sortedEnemies.length > 0 ? sortedEnemies[0].position : null
}

export default {
  info: {
    name: 'tRexBot',
    style: 9,
    team: 23
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    const threat = threats(player, enemies)
    const bigThreats = threatsFacingMe(player, enemies)
    const targets = enemiesInRange(player, enemies)
    if (threat.length > 0) {
      if (threat.length === 1 && targets.includes(threat[0]) && player.ammo) {
        return 'shoot'
      }
      // Check if we are in immediate danger, if so try to move
      log('In danger! Lets try to move')
      if (bigThreats.length) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    // CONCEPT: Nobody to shoot, if have ammo, go find someone to shoot
    if (player.ammo > 0) {
      const closestEnemy = findClosestEnemy(player, enemies)
      const enemyDir = calculateHeading(player.position, closestEnemy)
      if (enemyDir === player.direction && isActionSafe(player, 'move', enemies, game)) {
        return 'move'
      } else {
        return enemyDir
      }
    }

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction && isActionSafe(player, 'move', enemies, game)) {
        return 'move'
      } else {
        return ammoDir
      }
    }
    let tries = 0
    while (tries < 10) {
      const randomMove = makeRandomMove()
      if (isActionSafe(player, randomMove, enemies, game)) {
        return randomMove
      }
      tries++
    }

    return player.direction
  }
}
