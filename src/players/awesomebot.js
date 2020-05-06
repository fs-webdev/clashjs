import {
  makeRandomMove,
  sameColumn,
  sameRow,
  calculateDistance,
  calculateHeading,
  calculateNewPosition,
  isTargetVisible,
  enemiesInRange,
  threats,
  threatsFacingMe,
  canMoveForward,
  findClosestAmmo,
  isActionSafe,
  oppositeDirection,
} from "../lib/helpers";

import debug from "debug";

const DIRECTIONS = {
  NORTH: "north",
  EAST: "east",
  SOUTH: "south",
  WEST: "west",
  ALL: ["north", "east", "south", "west"],
};
const log = debug("clashjs:bot:starterbot");

export default {
  info: {
    name: "awesomebot",
    style: 1,
    team: 22,
  },
  ai: function (player, enemies, game) {
    log("Executing my AI function", player, enemies, game);

    const possibleFutureTarget = () => {
      const futureEnemies = enemies.map(enemy=>{
        enemy.position = calculateNewPosition(enemy, game)
        return enemy
      })
      return enemiesInRange(player, futureEnemies).length > 0
    }
    // const possibleFutureThreat = () => {
    //   const futureEnemies = enemies.map(enemy=>{
    //     enemy.position = calculateNewPosition(enemy, game)
    //     return enemy
    //   })
    //   return enemiesInRange(player, futureEnemies).length > 0
    // }
    const checkAndMove = () => {
      if(isActionSafe(player, 'move', enemies, game) && canMoveForward(player, game)){
        return 'move'
      }
    }

    // Check if we are in immediate danger, if so try to move
    const threats = threatsFacingMe(player, enemies);
    if (threats.length > 0) {
      threats.forEach(threat => {
        // if we are facing a direction that is not going to get us out of danger... give up? shoot back?
        if(isTargetVisible(player.position, player.direction, threat.position)) {
          if (player.ammo > 0) {
            return 'shoot'
          }
          // we are facing the target, but don't have ammo, we're dead, let's turn
        } else if (threat.direction === player.direction) {
          // we're dead, moving forward won't help. But, they might not shoot? Because the AI isn't setup to shoot? try to turn and then move again? But only if there's only one threat?
          if (player.ammo > 0) {
            return oppositeDirection(player.direction) // face your threat, fire next move
          } else {
            // find next best direction to turn?
          }
        } else {
          // moving forward should be fine to get out of danger unless the next move puts us in harm's way, but its too risky to stay still, so...
          if(canMoveForward(player, game)){
            return 'move'
          }
        }
      })
      // if we couldn't move forward or shoot, we should turn to the side, because we literally can't do anything to help ourselves now
      log("In danger! Lets try to turn");
      // exclude the direction you're facing and the direction the threat is facing, but head towards ammo
      // TODO:
    }

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies);
    if (player.ammo > 0 && targets.length > 0) {
      log("Found someone to shoot", targets);
      return "shoot";
    }

    // anyone is in a threat zone? if so, attack them or run away?
    if(player.ammo > 0 && possibleFutureTarget()){
      return ''
    }

    if (player.ammo > enemies.length) {
      // hunt the enemies
      const findClosestEnemy = function (player, enemies) {
        const sortedEnemies = enemies
          .map((enemy) => ({
            position: enemy.position,
            distance: calculateDistance(player.position, enemy.position),
          }))
          .sort((enemy1, enemy2) => enemy1.distance - enemy2.distance);

        return sortedEnemies.length > 0 ? sortedEnemies[0].position : null;
      };

      const closestEnemy = findClosestEnemy(player, enemies)
      const enemyDir = calculateHeading(player.position, closestEnemy)
      if (enemyDir === player.direction) {
        if (checkAndMove()) return checkAndMove()
      } else {
        return enemyDir;
      }
    }
    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game);

    if (closestAmmo) {
      log("Found some ammo", closestAmmo);
      const ammoDir = calculateHeading(player.position, closestAmmo);

      log("Heading towards ammo", ammoDir);
      if (ammoDir === player.direction) {
        if (checkAndMove()) return checkAndMove()
        //return "move";
      } else {
        return ammoDir;
      }
    }

    // Nothing else to do ... lets just make a random move
    log("Bummer, found nothing interesting to do ... making random move");
    // make a random safe move
    let count = 0
    while (count < 10) {
      const nextMove = makeRandomMove()
      if (isActionSafe(player, nextMove, enemies, game)) {
        return nextMove
      }
      count++
    }
    return ''
  },
};
