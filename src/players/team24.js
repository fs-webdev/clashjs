import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isTargetVisible,
  isActionSafe,
  sameColumn,
  sameRow
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:starterbot')

// const movingTowardsMe = function(player, enemies) {
//   if (!enemies.length) return []
//   var { position } = player
//
//   log('### position', player, position, enemies)
//
//   return enemies.filter(
//     e =>
//       e.isAlive && e.ammo > 0 && (sameRow(position, e.position) || sameColumn(position, e.position))
//   )
// }

export default {
  info: {
    name: 'Guardians',
    style: 32,
    team: 24
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    // Check if we are in immediate danger, if so try to move
    const immediateThreats = threatsFacingMe(player, enemies)
    if (immediateThreats.length > 0) {
      log('In danger! Lets try to move')
      const enemiesVisible = immediateThreats.filter(enemy => {
        return enemy.isAlive && isTargetVisible(enemy.position, enemy.direction, player.position)
      })
      // move but not if we can shoot the player
      // We will die if immediateThreats.direction === player.direction
      // Should we get ammo?
      if (!(enemiesVisible.length > 0 && player.ammo > 0) && canMoveForward(player, game)) {
        return 'move'
      }
    }

    // Should we shoot before running away?
    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }

    // Hunt if have ammo
    if (player.ammo > 0) {
      const potentialQuickHits = enemies.filter(enemy => {
        return (
          enemy.isAlive &&
          (sameColumn(player.position, enemy.position) || sameRow(player.position, enemy.position))
        )
      })
      if (potentialQuickHits.length > 0) {
        return calculateHeading(player.position, potentialQuickHits[0].position)
      }

      const onesWithNoAmo = enemies.filter(enemy => {
        return enemy.isAlive && enemy.ammo === 0
      })
      let target
      if (onesWithNoAmo.length > 0) {
        target = onesWithNoAmo[0]
      } else {
        const anyone = enemies.filter(enemy => {
          return enemy.isAlive
        })
        if (anyone.length > 0) {
          target = anyone[0]
        }
      }
      if (target) {
        const targetDir = calculateHeading(player.position, target.position)
        if (targetDir === player.direction) {
          if (isActionSafe(player, targetDir, enemies, game)) {
            return 'move'
          }
        } else {
          return targetDir
        }
      }
      //
      // if the enemy is on next row or column wait for them/turn towards them

      // Overlapped
      // } else {
    } // If no ammo, and someone is next to us, Enter run away mode

    // Question: What if another enemy is closer to the ammo?
    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo && player.ammo < 2) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction) {
        //If the next move towards ammo is safe to do then move, else stay (Maybe 2 rounds then try a different direction)
        if (isActionSafe(player, ammoDir, enemies, game)) {
          return 'move'
        } else {
          //TODO: Go the a random direction
        }
      } else {
        return ammoDir
      }
    }

    // Question: should we make a defensive move or an offensive move?
    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    const randomMove = makeRandomMove()
    if (isActionSafe(player, randomMove, enemies, game)) {
      return randomMove
    }
    return null
  }
}
