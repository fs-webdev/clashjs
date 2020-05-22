import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  inDangerOfAsteroid
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

export default {
  info: {
    name: 'starterbot',
    style: 20,
    team: 1
  },
  ai: function(player, enemies, game) {
    //
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (inDangerOfAsteroid(player.position, game.asteroids)) {
      log('In danger of asteroid! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction) {
        return 'move'
      } else {
        return ammoDir
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  }
}
