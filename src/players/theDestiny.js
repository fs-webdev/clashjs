import {
  makeRandomMove,
  calculateDistance,
  calculateHeading,
  enemiesInRange,
  threatsFacingMe,
  canMoveForward,
  findClosestAmmo,
  oppositeDirection,
  willIDie
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:theDestiny')

const history = []
const recorder = state => action => (history.push({ action, state }), action)

// Highest Threats
// Does anyone have ammo?
// If yes, the person who is closest with the most ammo is the highest threat
// If no, the person who is closest to any ammo is the highest threat

const ammoNotViable = (player, enemies, ammoPos) => {
  const destinyDistance = calculateDistance(player.position, ammoPos)
  const enemiesDistance = enemies.map(enemy => {
    return calculateDistance(enemy.position, ammoPos)
  })

  return enemiesDistance.some(enemyDistance => enemyDistance < destinyDistance)
}

const moveToward = (player, itemPosition) => {
  if (itemPosition) {
    const direction = calculateHeading(player.position, itemPosition)
    if (direction === player.direction) {
      return 'move'
    } else {
      return direction
    }
  }
  return null
}

const findNextTarget = (player, enemies) => {
  const targets = enemies
    .map(({ position }) => ({
      position: position,
      distance: calculateDistance(player.position, position)
    }))
    .sort((target1, target2) => target1.distance - target2.distance)

  return targets.length > 0 ? targets[0] : null
}

export default {
  info: {
    name: 'theDestiny',
    style: 111,
    team: 1
  },
  ai: function(player, enemies, game) {
    const deathImi = willIDie(player, game, enemies)
    if (deathImi) {
      const deathTargets = enemiesInRange(player, enemies)
      if (player.ammo > 0 && deathTargets.length > 0) {
        log('Found someone to shoot', deathTargets)
        return 'shoot'
      } else {
        return oppositeDirection(player.direction)
      }
    }

    const record = recorder({ player, enemies, game })
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log('In danger! Lets try to move')
      if (canMoveForward(player, game)) {
        return record('move')
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return record('shoot')
    }

    // Not in danger, nobody to shoot
    const closestAmmoPosition = findClosestAmmo(player, game)
    if (player.ammo) {
      const closestTarget = findNextTarget(player, enemies)

      const closestTargetTrajectory = moveToward(player, closestTarget.position, 'shoot')
      if (closestTargetTrajectory) {
        log('TARGET:', closestTargetTrajectory)
        return record(closestTargetTrajectory)
      }
    } else if (!ammoNotViable(player, enemies, closestAmmoPosition)) {
      // go collect more ammo
      const closestAmmoTrajectory = moveToward(player, closestAmmoPosition)
      if (closestAmmoTrajectory) {
        log('AMMO:', closestAmmoTrajectory)
        return record(closestAmmoTrajectory)
      }
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return record(makeRandomMove())
  }
}
