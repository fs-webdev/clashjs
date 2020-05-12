import {
  makeRandomMove,
  calculateDistance,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe,
  threats,
  sameRow,
  sameColumn,
  oppositeDirection
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:ET')

const findClosestEnemy = function(player, enemies) {
  log('### ammo, player, game', player, enemies)
  const sortedEnemies = enemies
    .map(enemy => ({
      position: enemy.position,
      distance: calculateDistance(player.position, enemy.position)
    }))
    .sort((ammo1, ammo2) => ammo1.distance - ammo2.distance)

  return sortedEnemies.length > 0 ? sortedEnemies[0].position : null
}

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  ALL: ['north', 'east', 'south', 'west']
}

function canKill(player, enemies) {
  const targets = enemiesInRange(player, enemies)
  return player.ammo > 0 && targets.length > 0
}

const calculateHeading2 = (startPos, endPos) => {
  log('calculateHeading', startPos, endPos)
  const [startY, startX] = startPos
  const [endY, endX] = endPos
  const diffY = Math.abs(startY - endY)

  const northOrSouth = (y1, y2) => (y1 - y2 > 0 ? DIRECTIONS.NORTH : DIRECTIONS.SOUTH)
  const eastOrWest = (x1, x2) => (x1 - x2 > 0 ? DIRECTIONS.WEST : DIRECTIONS.EAST)
  // return diffY > diffX ? northOrSouth(startY, endY) : eastOrWest(startX, endX);
  return diffY > 0 ? northOrSouth(startY, endY) : eastOrWest(startX, endX)
}

const getAvailableTargets = (player, enemies) => {
  if (player.ammo < 1) {
    return []
  }
  const potentialTargets = threats(player, enemies)
  return potentialTargets.filter(e => isTargetFacingAwayOrTowardMe(player, e))
}

const isTargetFacingAwayOrTowardMe = (player, target) => {
  log(
    'isTargetFacingOrTowardMe',
    player.position,
    player.direction,
    target.position,
    target.direction
  )
  return (
    ((target.direction === DIRECTIONS.NORTH || target.direction === DIRECTIONS.SOUTH) &&
      sameColumn(player.position, target.position)) ||
    ((target.direction === DIRECTIONS.EAST || target.direction === DIRECTIONS.WEST) &&
      sameRow(player.position, target.position))
  )
}

export default {
  info: {
    name: 'ET',
    style: 46,
    team: 14
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      if (canKill(player, enemies)) {
        return 'shoot'
      }
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    if (canKill(player, enemies)) {
      log('Found someone to shoot')
      return 'shoot'
    }

    // See if we can turn to shoot someone who is travelling away/toward us
    const targets = getAvailableTargets(player, enemies)
    log('targets', targets)
    if (targets.length > 0) {
      const targetPosition = targets[0].position
      const heading = calculateHeading(player.position, targetPosition)
      log('target heading', heading)
      return heading
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)
    const closestEnemy = findClosestEnemy(player, enemies)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading2(player.position, closestAmmo)
      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction) {
        // if safe to move to ammo, do it
        if (isActionSafe(player, 'move', enemies, game)) {
          return 'move'
        } else {
          // otherwise we turn towards the closestEnemy
          return oppositeDirection(calculateHeading2(player.position, closestEnemy))
        }

        // turn towards closest ammo
      } else {
        return ammoDir
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  }
}
