import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  isActionSafe,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isTargetVisible,
  calculateDistance
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:DanceDanceRevolution')

const VERTICAL = 0
const HORIZONTAL = 1
const DIRECTIONS = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  ALL: ['north', 'east', 'south', 'west']
}

const findClosestEnemy = function(player, enemies) {
  log('Looking for closest enemy')
  const sortedEnemies = enemies
    .map(enemy => ({
      ...enemy,
      distance: calculateDistance(player.position, enemy.position)
    }))
    .sort((enemy1, enemy2) => enemy1.distance - enemy2.distance)

  return sortedEnemies[0]
}

const EnemyIsInWhichKittyCorner = (player, enemy) => {
  let kittyCorner = ''
  const verticalDist = player.position[VERTICAL] - enemy.position[VERTICAL]
  if (verticalDist === 1) kittyCorner += 'N'
  if (verticalDist === -1) kittyCorner += 'S'
  const horizontalDist = Math.abs(player.position[HORIZONTAL] - enemy.position[HORIZONTAL])
  if (horizontalDist === -1) kittyCorner += 'E'
  if (horizontalDist === 1) kittyCorner += 'W'
  return kittyCorner
}

export default {
  info: {
    name: 'DanceDanceRevolution',
    style: 13,
    team: 13
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)
    const enemiesWithUsInSight = threatsFacingMe(player, enemies)
    const isSafeToMove = isActionSafe(player, 'move', enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (enemiesWithUsInSight.length > 0) {
      log('In danger! Lets try to move')

      // if we're facing them too, shoot!
      if (player.ammo > 0) {
        for (let enemy of enemiesWithUsInSight) {
          if (isTargetVisible(player.position, player.direction, enemy.position)) {
            return 'shoot'
          }
        }
      }

      // Do this if it brings us to safety
      if (canMoveForward(player, game) && isSafeToMove) {
        return 'move'
      }

      // if we're facing opposite of them, turn to the side to prepare to escape
      if (enemiesWithUsInSight.length) {
        log('Move to the side!')
        const enemyDir = enemiesWithUsInSight[0].direction
        if ([DIRECTIONS.NORTH, DIRECTIONS.SOUTH].includes(enemyDir)) {
          const chooseTheRight = isActionSafe(player, DIRECTIONS.EAST, enemies, game)
          const canChooseToTheRight = canMoveForward(
            Object.assign({ direction: DIRECTIONS.EAST }, player),
            game
          )
          return chooseTheRight && canChooseToTheRight ? DIRECTIONS.EAST : DIRECTIONS.WEST
        } else {
          const ascend = isActionSafe(player, DIRECTIONS.NORTH, enemies, game)
          const canAscend = canMoveForward(
            Object.assign({ direction: DIRECTIONS.NORTH }, player),
            game
          )
          return ascend && canAscend ? DIRECTIONS.NORTH : DIRECTIONS.SOUTH
        }
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    if (player.ammo > 0) {
      // Lay low to snipe
      if (isTargetVisible(player.position, player.direction, game.ammoPosition)) {
        for (let enemy of enemiesWithUsInSight) {
          if (isTargetVisible(player.position, player.direction, enemy.position)) {
            log('They fell for our bait. SHOOT!')
            return 'shoot'
          }
        }
        log('Sniping with ammo as bait')
        return null
      }

      // Start the hunt!
      const closestEnemy = findClosestEnemy(player, enemies)
      const closestEnemyDir = calculateHeading(player.position, closestEnemy.position)
      log('Hunt down closest enemy!', closestEnemy.name)
      if (closestEnemyDir === player.direction && isSafeToMove) {
        const kittyCorner = EnemyIsInWhichKittyCorner(player, closestEnemy)
        switch (kittyCorner) {
          case 'NE':
            // TODO: Face direction that enemy is likely to move into
            break
          // case 'NE':
          //   break
          // case 'NE':
          //   break
          // case 'NE':
          //   break
          default:
            return 'move'
        }
      } else {
        return closestEnemyDir
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      const ammoDir = calculateHeading(player.position, closestAmmo)

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
