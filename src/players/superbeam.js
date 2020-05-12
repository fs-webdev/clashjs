import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:superbeam')
const directions = ['north', 'east', 'south', 'west']

export default {
  info: {
    name: 'superbeam',
    style: 59,
    team: 20
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    const targets = enemiesInRange(player, enemies)
    const threats = threatsFacingMe(player, enemies)

    const targetNames = targets.map(t => t.name)
    const threatNames = threats.map(t => t.name)
    const threatsWithinTargets = threatNames.reduce((acc, name) => {
      if (targetNames.includes(name)) {
        return acc + 1
      }
      return acc
    }, 0)

    // Check if we are in immediate danger, if so try to move
    if (threats.length > 0) {
      // all names of threats match all names of enemiesInRange
      if (threats.length === threatsWithinTargets && player.ammo > 0) {
        return 'shoot'
      }

      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      } else {
        // rotate clockwise
        const directionIndex = directions.indexOf(player.direction)
        const directionRotatedClockwise = directions[(directionIndex + 1) % directions.length]
        return directionRotatedClockwise
      }
    }

    // Not in danger, so lets see if we can shoot somebody
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
