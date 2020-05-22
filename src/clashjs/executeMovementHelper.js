var _ = require('lodash')
const { playSound, lasers, explosions } = require('../lib/sound-effects')
var DIRECTIONS = ['north', 'east', 'south', 'west']

var isVisible = (originalPosition = [], finalPosition = [], direction = []) => {
  switch (direction) {
    case DIRECTIONS[0]:
      return originalPosition[1] === finalPosition[1] && originalPosition[0] > finalPosition[0]
    case DIRECTIONS[1]:
      return originalPosition[0] === finalPosition[0] && originalPosition[1] < finalPosition[1]
    case DIRECTIONS[2]:
      return originalPosition[1] === finalPosition[1] && originalPosition[0] < finalPosition[0]
    case DIRECTIONS[3]:
      return originalPosition[0] === finalPosition[0] && originalPosition[1] > finalPosition[1]
    default:
      break
  }
}

var safeMovement = (value, size) => {
  if (value < 0) return 0
  if (value > size - 1) return size - 1
  return value
}

var clashCoreUtils = data => {
  var {
    playerIndex,
    playerAction,
    playerStates,
    playerInstances,
    gameEnvironment,
    evtCallback,
    coreCallback
  } = data
  var currentPlayerState = playerStates[playerIndex]

  if (DIRECTIONS.indexOf(playerAction) !== -1) {
    currentPlayerState.direction = playerAction
    return playerStates
  }

  if (playerAction === 'move') {
    switch (currentPlayerState.direction) {
      case DIRECTIONS[0]:
        currentPlayerState.position[0]--
        break
      case DIRECTIONS[1]:
        currentPlayerState.position[1]++
        break
      case DIRECTIONS[2]:
        currentPlayerState.position[0]++
        break
      case DIRECTIONS[3]:
        currentPlayerState.position[1]--
        break
      default:
        break
    }

    // prevent the player to go over the world
    currentPlayerState.position[0] = safeMovement(
      currentPlayerState.position[0],
      gameEnvironment.gridSize
    )
    currentPlayerState.position[1] = safeMovement(
      currentPlayerState.position[1],
      gameEnvironment.gridSize
    )

    // check if the player collected ammo
    gameEnvironment.ammoPosition.forEach((el, index) => {
      if (el[0] === currentPlayerState.position[0] && el[1] === currentPlayerState.position[1]) {
        gameEnvironment.ammoPosition.splice(index, 1)
        currentPlayerState.ammo += 1
        coreCallback('AMMO', { player: currentPlayerState })
      }
    })
    // check if the player collected cargo
    gameEnvironment.cargos.forEach((cargo, index) => {
      if (
        cargo.position[0] === currentPlayerState.position[0] &&
        cargo.position[1] === currentPlayerState.position[1]
      ) {
        gameEnvironment.cargos.splice(index, 1)
        coreCallback('CARGO', { player: currentPlayerState, cargo })
      }
    })
  }

  if (playerAction === 'shoot' && currentPlayerState.ammo > 0) {
    playSound(lasers[`laser${_.random(8)}`])
    currentPlayerState.ammo -= 1

    let kills = []
    let survivors = []
    evtCallback('SHOOT', {
      shooter: playerIndex,
      origin: currentPlayerState.position,
      direction: currentPlayerState.direction
    })

    playerStates.forEach((enemyObject, enemyIndex) => {
      if (
        enemyObject.isAlive &&
        isVisible(currentPlayerState.position, enemyObject.position, currentPlayerState.direction)
      ) {
        kills.push(enemyIndex)
        enemyObject.isAlive = false
      }
    })

    if (kills.length) {
      setTimeout(() => playSound(explosions[`explode${_.random(2)}`]), 100)
      survivors = _.filter(playerStates, player => player.isAlive)
      coreCallback('KILL', {
        killer: playerInstances[playerIndex],
        killed: _.map(kills, index => playerInstances[index])
      })
      evtCallback('KILL', {
        killer: playerIndex,
        killed: kills
      })
    }
  }

  return playerStates
}

module.exports = clashCoreUtils
