const _ = require('lodash')
const debug = require('debug')
const log = debug('clashjs:helpers')

const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  ALL: ['north', 'east', 'south', 'west']
}

const VERTICAL = 0
const HORIZONTAL = 1
const MOVE = 'move'
const SHOOT = 'shoot'

function calculateDistance([startY = 0, startX = 0], [endY = 0, endX = 0]) {
  return Math.abs(startY - endY) + Math.abs(startX - endX)
}

function calculateHeading(startPos, endPos) {
  log('calculateHeading', startPos, endPos)
  const [startY, startX] = startPos
  const [endY, endX] = endPos
  const diffY = Math.abs(startY - endY)
  const diffX = Math.abs(startX - endX)
  const northOrSouth = (y1, y2) => (y1 - y2 > 0 ? DIRECTIONS.NORTH : DIRECTIONS.SOUTH)
  const eastOrWest = (x1, x2) => (x1 - x2 > 0 ? DIRECTIONS.WEST : DIRECTIONS.EAST)

  return diffY > diffX ? northOrSouth(startY, endY) : eastOrWest(startX, endX)
}

function calculateNewPosition(player, game) {
  const { position: newPosition, direction } = player

  switch (direction) {
    case DIRECTIONS.NORTH:
      newPosition[VERTICAL] = Math.max(0, newPosition[VERTICAL] - 1)
      break
    case DIRECTIONS.EAST:
      newPosition[HORIZONTAL] = Math.min(game.gridSize, newPosition[HORIZONTAL] + 1)
      break
    case DIRECTIONS.SOUTH:
      newPosition[VERTICAL] = Math.min(game.gridSize, newPosition[VERTICAL] + 1)
      break
    case DIRECTIONS.WEST:
      newPosition[HORIZONTAL] = Math.max(0, newPosition[HORIZONTAL] - 1)
      break
    default:
      break
  }
  return newPosition
}

function canMoveForward(player, game) {
  switch (player.direction) {
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

function enemiesInRange(currentPlayerState, enemyStates) {
  return enemyStates.filter(
    enemy =>
      enemy.isAlive &&
      isTargetVisible(currentPlayerState.position, currentPlayerState.direction, enemy.position)
  )
}

function findClosestAmmo(player, game) {
  log('### ammo, player, game', player, game)
  const sortedAmmo = game.ammoPosition
    .map(ammoPos => ({
      position: ammoPos,
      distance: calculateDistance(player.position, ammoPos)
    }))
    .sort((ammo1, ammo2) => ammo1.distance - ammo2.distance)

  return sortedAmmo.length > 0 ? sortedAmmo[0].position : null
}

function inDangerOfAsteroid(position, asteroids) {
  const [playerY, playerX] = position
  return asteroids.some(
    asteroid =>
      asteroid.detonateIn >= 0 &&
      asteroid.detonateIn < 2 &&
      asteroid.position[0] === playerY &&
      asteroid.position[1] === playerX
  )
}

function isActionSafe(player, action, enemies, game) {
  let { position: futureState } = player

  if (action === MOVE) {
    futureState = calculateNewPosition(player, game)
  }

  return threatsFacingMe({ position: futureState }, enemies).length === 0
}

function isOnAsteroid(position, asteroids) {
  const [playerY, playerX] = position
  return asteroids.some(
    asteroid =>
      asteroid.detonateIn >= 0 &&
      asteroid.position[0] === playerY &&
      asteroid.position[1] === playerX
  )
}

function isTargetVisible(playerPosition, playerDirection, targetPosition) {
  log('isTargetVisible', playerPosition, playerDirection, targetPosition)
  switch (playerDirection) {
    case DIRECTIONS.NORTH:
      return (
        sameColumn(playerPosition, targetPosition) &&
        playerPosition[VERTICAL] > targetPosition[VERTICAL]
      )
    case DIRECTIONS.EAST:
      return (
        sameRow(playerPosition, targetPosition) &&
        playerPosition[HORIZONTAL] < targetPosition[HORIZONTAL]
      )
    case DIRECTIONS.SOUTH:
      return (
        sameColumn(playerPosition, targetPosition) &&
        playerPosition[VERTICAL] < targetPosition[VERTICAL]
      )
    case DIRECTIONS.WEST:
      return (
        sameRow(playerPosition, targetPosition) &&
        playerPosition[HORIZONTAL] > targetPosition[HORIZONTAL]
      )
    default:
      return false
  }
}

function makeRandomMove(includeShoot = false) {
  const randomMove = possibleMoves => (Math.random() > 0.33 ? MOVE : _.sample(possibleMoves))
  return includeShoot ? randomMove(_.concat(DIRECTIONS.ALL, SHOOT)) : randomMove(DIRECTIONS.ALL)
}

function oppositeDirection(direction) {
  switch (direction) {
    case DIRECTIONS.NORTH:
      return DIRECTIONS.SOUTH
    case DIRECTIONS.SOUTH:
      return DIRECTIONS.NORTH
    case DIRECTIONS.WEST:
      return DIRECTIONS.EAST
    case DIRECTIONS.EAST:
      return DIRECTIONS.WEST
    default:
      return undefined
  }
}

function sameColumn(pos1, pos2) {
  return pos1[HORIZONTAL] === pos2[HORIZONTAL]
}

function sameRow(pos1, pos2) {
  return pos1[VERTICAL] === pos2[VERTICAL]
}

function threats(player, enemies) {
  if (!enemies.length) return []
  var { position } = player

  log('### position', player, position, enemies)

  return enemies.filter(
    e =>
      e.isAlive && e.ammo > 0 && (sameRow(position, e.position) || sameColumn(position, e.position))
  )
}

function threatsFacingMe(player, enemies) {
  return threats(player, enemies).filter(enemy =>
    isTargetVisible(enemy.position, enemy.direction, player.position)
  )
}

module.exports = {
  calculateDistance,
  calculateHeading,
  calculateNewPosition,
  canMoveForward,
  enemiesInRange,
  findClosestAmmo,
  inDangerOfAsteroid,
  isActionSafe,
  isOnAsteroid,
  isTargetVisible,
  makeRandomMove,
  oppositeDirection,
  sameColumn,
  sameRow,
  threats,
  threatsFacingMe
}
