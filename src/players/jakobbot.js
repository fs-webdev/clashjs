import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe,
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:jakobbot')

export default {
  info: {
    name: 'jakobbot',
    style: 10,
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
      if (
        canMoveForward(player, game) &&
        isActionSafe(player, 'move', enemies, game)
      ) {
        return 'move'
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction) {
        const safe = isActionSafe(player, 'move', enemies, game)
        if (safe) return 'move'
      } else {
        return ammoDir
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    const safe = isActionSafe(player, 'move', enemies, game)
    if (safe) {
      return makeRandomMove()
    }
  },
}
