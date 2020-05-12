import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isTargetVisible,
  oppositeDirection,
  isActionSafe
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:derricksBotty')

const calculateDistance = ([startY = 0, startX = 0], [endY = 0, endX = 0]) =>
  Math.abs(startY - endY) + Math.abs(startX - endX)

const findClosestPlayer = function(player, enemies) {
  log('### ammo, player, game', player)
  const sortedPlayers = enemies
    .reduce((arr, nextPlayer) => {
      arr.push(nextPlayer.position)
      return arr
    }, [])
    .map(playerPos => ({
      position: playerPos,
      distance: calculateDistance(player.position, playerPos)
    }))
    .sort((player1, player2) => player1.distance - player2.distance)

  return sortedPlayers.length > 0 ? sortedPlayers[0].position : null
}

export default {
  info: {
    name: 'derricksBotty',
    style: 84,
    team: 11
  },
  ai: function(player, enemies, game) {
    log('Executing my AI function', player, enemies, game)

    const threats = threatsFacingMe(player, enemies)

    // Check if we are in immediate danger, if so try to move
    if (threats.length > 0) {
      log('In danger! Lets try to move')
      //If there's only one enemy facing me can I shoot them?
      if (
        threats.length === 1 &&
        isTargetVisible(player.position, player.direction, threats[0].position) &&
        player.ammo
      ) {
        //try to shoot them
        return 'shoot'

        //Check if we can move forward and if that will move us away
      } else if (canMoveForward(player, game) && isActionSafe(player, 'move', enemies, game)) {
        return 'move'
      } else {
        if (player.ammo) {
          for (let threat of threats) {
            if (isTargetVisible(player.position, player.direction, threats[0].position)) {
              return 'shoot'
            }
          }
        }
      }
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies)
    if (player.ammo > 0 && targets.length > 0) {
      log('Found someone to shoot', targets)
      return 'shoot'
    }
    const closestPlayer = findClosestPlayer(player, enemies)
    //If we have ammo try to hunt someone down
    if (player.ammo) {
      if (closestPlayer) {
        log('Found a player', closestPlayer)
        const playerDir = calculateHeading(player.position, closestPlayer)

        log('Heading towards player', playerDir)
        if (playerDir === player.direction && isActionSafe(player, 'move', enemies, game)) {
          return 'move'
        } else {
          return playerDir
        }
      }
    }
    // Not in danger, nobody to shoot, lets go collect more ammo

    const closestAmmo = findClosestAmmo(player, game)

    if (closestAmmo) {
      log('Found some ammo', closestAmmo)
      const ammoDir = calculateHeading(player.position, closestAmmo)

      log('Heading towards ammo', ammoDir)
      if (ammoDir === player.direction && isActionSafe(player, 'move', enemies, game)) {
        return 'move'
      } else {
        return ammoDir
      }
    }

    if (!canMoveForward(player, game)) {
      return oppositeDirection(player.direction)
    }

    // Nothing else to do ... lets just make a random move
    log('Bummer, found nothing interesting to do ... making random move')
    return makeRandomMove()
  }
}
