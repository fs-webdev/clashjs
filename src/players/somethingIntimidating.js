import {
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe
} from '../lib/helpers'
import _ from 'lodash'
import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  ALL: ['north', 'east', 'south', 'west']
}

const MOVE = 'move'
// const SHOOT = 'shoot'

const canMoveSafeForward = function(player, game, direction) {
  switch (direction) {
    case DIRECTIONS.NORTH:
      return player.position[0] > 0
    case DIRECTIONS.EAST:
      return player.position[1] < game.gridSize - 1
    case DIRECTIONS.SOUTH:
      return player.position[0] < game.gridSize - 1
    case DIRECTIONS.WEST:
      return player.position[1] > 0
    default:
      return false
  }
}

const makeRandomMove = (player, enemies, game) => {
  // const randomMove = possibleMoves => (Math.random() > 0.33 ? MOVE : _.sample(possibleMoves))
  let possibleMoves = _.shuffle(_.concat(DIRECTIONS.ALL, MOVE))
  let futureMove
  for (let i = 0; i < possibleMoves.length; i++) {
    futureMove = possibleMoves[i]
    if (
      canMoveSafeForward(player, game, futureMove) &&
      isActionSafe(player, futureMove, enemies, game)
    ) {
      return futureMove
    }
  }
  return 0
}

export default {
  info: {
    name: 'somethingIntimidating',
    style: 96,
    team: 16
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)

    if (player.ammo > 0) {
      if (targets.length > 0) {
        log('Found someone to shoot', targets)
        return 'shoot'
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
    // TODO (is random move safe?)
    return makeRandomMove(player, enemies, game)
  }
}
