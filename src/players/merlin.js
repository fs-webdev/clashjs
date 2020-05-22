import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  sameRow,
  sameColumn,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:merlin')

const findEnemyInSameRowOrColumn = function (player, enemies, game) {

  const enemiesInRowOrColumn = enemies.filter(
    (e) =>
      e.isAlive &&
      (sameRow(player.position, e.position) || sameColumn(player.position, e.position))
  )
  log('### MERLIN WAS HERE ### enemiesInRowOrColumn', enemiesInRowOrColumn)
  if (enemiesInRowOrColumn.length > 0) {
    log('### MERLIN WAS HERE ###  FOUND ENEMY IN ROW OR COLUMN THAT IS NOT FACING US AND WE\'RE NOT FACING')
    return enemiesInRowOrColumn[0].position
  }
  return null
}

export default {
  info: {
    name: 'merlin',
    style: 108,
    team: 15,
  },
  ai: function (player, enemies, game) {
    log('Executing AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Not in danger, and an enemy is not in range, so if we have ammo, try to turn toward an enemy
    if (player.ammo > 0) {
      const enemyInRowOrColumnHeading = findEnemyInSameRowOrColumn(player, enemies, game)
      log('### MERLIN WAS HERE ### Finding Enemy...', enemyInRowOrColumnHeading)
      if (enemyInRowOrColumnHeading) {
        const enemyDir = calculateHeading(player.position, enemyInRowOrColumnHeading)

        log('### MERLIN WAS HERE ### Turning toward enemy in my row or column', enemyDir)
        return enemyDir
      }
    }

    // Not in danger, nobody to shoot and we don't have ammo, lets go collect more ammo
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