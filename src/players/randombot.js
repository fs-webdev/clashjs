var { makeRandomMove } = require('../lib/helpers.js')

export default {
  info: {
    name: 'random',
    team: 0,
  },
  ai: function (playerState, enemiesStates, gameEnvironment) {
    return makeRandomMove()
  },
}
