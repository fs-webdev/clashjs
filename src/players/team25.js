import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe
} from '../lib/helpers'

import debug from 'debug'
const log = debug('clashjs:bot:team25')
let lastMove = null
let sameMove = 0

export default {
  info: {
    name: 'RabidDog',
    style: 94,
    team: 25,
  },
  ai: function (player, enemies, game) {
    function innerAI(player, enemies, game) {
      log('Executing my AI function', player, enemies, game)
      console.log(`LOOK: Ammo=${player.ammo}`)
      // Check if we are in immediate danger, if so try to move
      if (threatsFacingMe(player, enemies).length > 0) {
        log('In danger! Lets try to move')
        if (canMoveForward(player, game)) {
          return 'move'
        }
      }
  
      // Look for targets first - like a rabid dog
      if (player.ammo > 0) {
        const targets = enemiesInRange(player, enemies)
        if (targets.length > 0) {
          log('Found someone to shoot', targets)
          return 'shoot'
        }
        else {
          let move = null
          enemies.forEach((enemy) => {
            if (enemy.isAlive) {
              console.log(`LOOK: enemy=${JSON.stringify(enemy)}`)
              console.log(`LOOK: player=${JSON.stringify(player)}`)
              move = calculateHeading(player.position, enemy.position)
              console.log(`LOOK: attack move=${move}`)
            }
            // enemy={"position":[4,0],"direction":"west","ammo":0,"isAlive":true,"id":"P3D5AT13","name":"random"}
            //player={"position":[4,4],"direction":"west","ammo":1,"isAlive":true,"id":"MLUMBI4J","name":"AwesomeSauce"}
          })
          if (move) {
            return move
          }
        }
    
      }
  
      // Not in danger, nobody to shoot, lets go collect more ammo
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
    }

    let thisMove = innerAI(player, enemies, game)
    // if (thisMove === lastMove) {
    //   sameMove++;
    // }
    // else {
    //   lastMove = thisMove;
    //   sameMove = 0;
    // }
    // if (sameMove > 10) {
    //   const randMove = makeRandomMove();
    //   if (isActionSafe(player, randMove, enemies, game)) {
    //     lastMove = thisMove = randMove;
    //     sameMove = 0;
    //   }
    // }
    return thisMove
  },
}

