import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

export default {
  info: {
    name: 'neinobot',
    style: 9,
    team: 9,
  },
  ai: function (player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Lets see if we can shoot somebody
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

    // if we have ammo, use it
    if (player.ammo > 0) {

      // top left
      if (player.position === [0,0]) {
        if (player.direction === 'east') {
          return 'south'
        }
        else {
          return 'east'
        }
      }

      // top right
      if (player.position === [0, 6]) {
        if (player.direction === 'west') {
          return 'south'
        }
        else {
          return 'west'
        }
      }

      // bottom left
      if (player.position === [6, 0]) {
        if (player.direction === 'east') {
          return 'north'
        }
        else {
          return 'east'
        }
      }

      // bottom right
      if (player.position === [6,6]) {
        if (player.direction === 'west') {
          return 'north'
        }
        else {
          return 'west'
        }
      }

      // hide in a corner
      if (player.position[1] !== 0 && player.position[1] !== 6) {
      
        if (player.position[1] <= 3) {
          if (player.direction !== 'west') {
            return 'west'
          }
          return 'move'
        }
        if (player.position[1] > 3) {
          if (player.direction !== 'east') {
            return 'east'
          }
          return 'move'
        }
      }

      if (player.position[0] !== 0 && player.position[0] !== 6) {
      
        if (player.position[1] <= 3) {
          if (player.direction !== 'south') {
            return 'south'
          }
          return 'move'
        }
        if (player.position[1] > 3) {
          if (player.direction !== 'north') {
            return 'north'
          }
          return 'move'
        }
      }
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
  },
}
