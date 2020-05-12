import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange
} from '../lib/helpers'

import debug from 'debug'

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  ALL: ['north', 'east', 'south', 'west']
}
const log = debug('clashjs:bot:dilbert')

export default {
  info: {
    name: 'dilbert',
    style: 52,
    team: 21
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // #1 Shoot! (If ammo)
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    const threats = threatsFacingMe(player, enemies)
    // #2 Evade first
    // Check if we are in immediate danger, if so try to move
    if (threats.length > 0) {
      log('In danger! Lets try to move')

      // Look at position and decide if we should move or turn
      // If moving would keep us in the line of fire, then turn before moving

      // Evade the first threat
      //Check if enemy is in the same row (must move north or south to evade)

      //let canMoveForward = canMoveForward(player, game);

      if (player.position[0] === threats[0].position[0]) {
        // Need to move up or down
        // See if we can move up?
        if (player.direction === DIRECTIONS.EAST || player.direction === DIRECTIONS.WEST) {
          return player.position[0] < game.gridSize / 2 ? 'south' : 'north'
        } else if (player.direction === DIRECTIONS.NORTH) {
          if (canMoveForward) {
            return 'move'
          } else {
            return 'south'
          }
        } else if (player.direction === DIRECTIONS.SOUTH) {
          if (canMoveForward) {
            return 'move'
          } else {
            return 'north'
          }
        }
      } else {
        if (player.direction === DIRECTIONS.NORTH || player.direction === DIRECTIONS.SOUTH) {
          return player.position[1] < game.gridSize / 2 ? 'east' : 'west'
        } else if (player.direction === DIRECTIONS.EAST) {
          if (canMoveForward) {
            return 'move'
          } else {
            return 'west'
          }
        } else if (player.direction === DIRECTIONS.WEST) {
          if (canMoveForward) {
            return 'move'
          } else {
            return 'east'
          }
        }
      }
    }

    // #3 Predictive evade (Based on where the enemies are currently)

    // #4 Find Enemy (if have ammo)

    // Find closest corner if we have enough ammo
    if (player.ammo > enemies.length / 2) {
      if (player.position[1] > 0) {
        if (player.direction === DIRECTIONS.WEST) {
          return 'move'
        } else {
          return 'west'
        }
      } else {
        if (player.direction === DIRECTIONS.EAST) {
          return
        } else {
          return 'east'
        }
      }
    } else {
      // #5 Find Ammo (if don't have any)
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
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  }
}
