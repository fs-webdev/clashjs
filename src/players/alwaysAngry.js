import {
  makeRandomMove,
  calculateHeading,
  enemiesInRange,
  threatsFacingMe,
  canMoveForward,
  findClosestAmmo,
  isActionSafe
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

export default {
  info: {
    name: 'AlwaysAngry',
    style: 31,
    team: 8
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    // can I kill?
    const threats = threatsFacingMe(player, enemies)
    if (threats.length > 0) {
      const anyInLine = enemiesInRange(player, threats)
      const isSafeToShoot = isActionSafe(player, 'shoot', enemies, game)
      const isSafeToMove = isActionSafe(player, 'move', enemies, game)
      if (player.ammo && anyInLine && !isSafeToMove) {
        return 'shoot'
      }
      if (!isSafeToShoot && isSafeToMove && canMoveForward(player, game)) {
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
    // when ammo is found, see if the ammo is contested. if so, who will get there first?
    // if not us, do we have ammo? get in range to shoot the space where the ammo is
    // if us, go get the ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)
      const isSafe = isActionSafe(player, ammoDir, enemies, game)
      log('Heading towards ammo', ammoDir)
      if (isSafe && ammoDir === player.direction) {
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
