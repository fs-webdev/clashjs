import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threats,
  canMoveForward,
  enemiesInRange,
  isActionSafe,
  calculateDistance
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:ninjaPuppies')

const findClosestEnemy = function(player, enemies) {
  log('### ammo, player, game', player, enemies)
  const sortedEnemies = enemies
    .map(enemy => ({
      position: enemy.position,
      distance: calculateDistance(player.position, enemy.position)
    }))
    .sort((enemy1, enemy2) => enemy1.distance - enemy2.distance)

  return sortedEnemies.length > 0 ? sortedEnemies[0].position : null
}

/**
1. are we in another player’s range?
  1. if we don’t have ammo: move out of the way of another player
  2: if we have ammo: turn to face them and shoot
2: no ammo? go after some
3: if ammo is on the map or nearby, go after it
4: if no ammo, go after another player
  (later: if ammo or another player is closer, decide on proximity)
TODO: Figure out what to do with not-alive players
*/
export default {
  info: {
    name: 'ninjaPuppies',
    style: 77,
    team: 5
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (threats(player, enemies).length > 0) {
      if (shootIfAmmo()) return 'shoot'
      // are we facing them too?
      //   do we have ammo? shoot
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Not in danger, so lets see if we can shoot somebody

    if (shootIfAmmo()) return 'shoot'

    const closestAmmo = findClosestAmmo(player, game)

    // if we have enough ammo, see if we can find someone to shoot
    if (player.ammo >= 1 || (player.ammo > 0 && !closestAmmo)) {
      let closestBadGuyPos = findClosestEnemy(player, enemies)

      // find closest enemy, shoot if possible

      let counter = 0
      while (closestBadGuyPos) {
        const enemyDirection = calculateHeading(player.position, closestBadGuyPos)
        const action = enemyDirection === player.direction ? 'move' : enemyDirection
        if (isActionSafe(player, action, enemies, game)) {
          return action
        }
        closestBadGuyPos = findClosestEnemy(
          player,
          enemies.filter(enemy => enemy.position !== closestBadGuyPos)
        )
        counter += 1
        if (counter > 10) break
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
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

    // If we have ammo and are facing someone, we can shoot them
    function shootIfAmmo() {
      const targets = enemiesInRange(player, enemies)
      if (player.ammo > 0 && targets.length > 0) {
        log('Found someone to shoot', targets)
        return true
      }
      return false
    }
  }
}
