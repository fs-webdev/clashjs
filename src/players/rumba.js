import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe
} from '../lib/helpers'

function targetClosestPlayer(player, enemies) {
  const targets = enemiesInRange(player, enemies)
  if (player.ammo > 0 && targets.length > 0) {
    return 'shoot'
  }
  if (targets.length <= 0) {
    const enemyPositionsArray = enemies.map(enemy => enemy.position)
    const closestEnemy = findClosestAmmo(player, { ammoPosition: enemyPositionsArray })
    const enemyDir = calculateHeading(player.position, closestEnemy)
    return moveTowardsPosition(enemyDir, player, false)
  }
}

function moveTowardsPosition(heading, player) {
  if (heading === player.direction) {
    return 'move'
  } else {
    return heading
  }
}

function evade(player, enemies, game) {
  // Check if we are in immediate danger, if so try to move
  if (threatsFacingMe(player, enemies).length > 0) {
    if (isActionSafe(player, 'move', enemies, game) && canMoveForward(player, game)) {
      return 'move'
    } else {
      return makeRandomMove()
    }
  }
}

export default {
  info: {
    name: 'Rumba',
    style: 7,
    team: 12
  },
  ai: function(player, enemies, game) {
    const modes = ['resupply', 'survival', 'targetClosestPlayer']
    let currentMode = modes[1] // survival

    if (player.ammo > 0) currentMode = modes[2] // targetClosestPlayer
    if (enemies.filter(enemy => enemy.isAlive).length === 1) {
      currentMode = player.ammo > 0 ? modes[2] : modes[0]
    }
    // console.log("Executing my AI function", player, enemies, game);

    // Lets find somebody to shoot
    if (currentMode === 'targetClosestPlayer') {
      return targetClosestPlayer(player, enemies)
    }
    // Check if we are in immediate danger, if so try to move
    if (currentMode === 'survival') {
      return evade(player, enemies, game)
    }
    // Lets find somebody to shoot
    if (currentMode === 'resupply') {
      const closestAmmo = findClosestAmmo(player, game)
      if (closestAmmo) {
        const ammoDir = calculateHeading(player.position, closestAmmo)
        return moveTowardsPosition(ammoDir, player)
      }
    }

    // Check if we are in immediate danger, if so try to move
    return evade(player, enemies, game)
  }
}
