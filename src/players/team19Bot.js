import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

export default {
  info: {
    name: 'War Bird',
    style: 59,
    team: 19
  },
  ai: function(player, enemies, game) {
    console.log('Executing my AI function', player, enemies, game)

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo && player.ammo < 2) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction) {
        return 'move'
      } else {
        return ammoDir
      }
    }

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Head to corner
    // const cornerDirection = calculateHeading(player.position, [0, 0])
    // if (player.position !== [0,0]) {
    //   if (cornerDirection === player.direction) {
    //     return "move";
    //   } else {
    //     return cornerDirection;
    //   }
    // } else {
    //   switch (player.direction) {
    //     case 'south': return 'east'
    //     case 'east': return 'south'
    //     default: return 'south'
    //   }
    // }

    return makeRandomMove(true)
  }
}
