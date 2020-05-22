import {
  makeRandomMove,
  calculateHeading,
  calculateDistance,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:lrbot')

export default {
  info: {
    name: 'lrbot',
    style: 20,
    team: 3,
  },
  ai: function (player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    //If another player is closer to the ammo, try to line up our shot to hit them.
    const ourDistanceFromAmmo = calculateDistance(player.position, closestAmmo)
    let closestPlayerToAmmo = player
    let smallestDistanceFromAmmo = ourDistanceFromAmmo

    enemies.forEach(enemy => {
      const enemyDistanceFromAmmo = calculateDistance(enemy.position, closestAmmo)
      if (enemyDistanceFromAmmo < smallestDistanceFromAmmo) {
        closestPlayerToAmmo = enemy
        smallestDistanceFromAmmo = enemyDistanceFromAmmo
      }
    })

    if (closestPlayerToAmmo !== player) {
      const headingDir = calculateHeading(player.position, closestAmmo)
    }

    //Otherwise head for the ammo

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      //If another player is closer to the ammo, try to line up our shot to hit them.
      if (player.ammo > 0) {
        const ourDistanceFromAmmo = calculateDistance(player.position, closestAmmo)
        let closestPlayerToAmmo = player
        let smallestDistanceFromAmmo = ourDistanceFromAmmo

        enemies.forEach(enemy => {
          const enemyDistanceFromAmmo = calculateDistance(enemy.position, closestAmmo)
          if (enemyDistanceFromAmmo < smallestDistanceFromAmmo) {
            closestPlayerToAmmo = enemy
            smallestDistanceFromAmmo = enemyDistanceFromAmmo
          }
        })

        if (closestPlayerToAmmo !== player) {
          let headingDir
          if (Math.abs(closestAmmo[0] - player.position[0]) <  Math.abs(closestAmmo[1] - player.position[1])) {
            headingDir = calculateHeading(player.position, [closestAmmo[0], player.position[1]])
          } else {
            headingDir = calculateHeading(player.position, [closestAmmo[1], player.position[0]])
          }

          if (headingDir === player.direction) {
            return 'move'
          } else {
            return headingDir
          }
        }
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  },
}
