const _ = require('lodash')
const starterbot = require('./players/starterbot').default
const randombot = require('./players/randombot').default
const beasty = require('./players/beasty').default

const bots = {}

for (let i = 1; i <= 25; i++) {
  const random = Math.random()
  const template =
    random > 0.9 ? beasty : random < 0.35 ? randombot : starterbot

  const clonedBot = Object.assign({}, template, {
    info: { name: `${template.info.name} #${i}`, team: i },
  })

  bots[`bot${i}`] = clonedBot
}

module.exports = bots
