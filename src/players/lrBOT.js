import {
  makeRandomMove,
  calculateHeading,
  calculateDistance,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe,
} from "../lib/helpers";

import debug from "debug";
const log = debug("clashjs:bot:lrbot");

function getClosestPlayerToAmmo(closestAmmo, player, enemies) {
  const ourDistanceFromAmmo = calculateDistance(player.position, closestAmmo);
  let closestPlayerToAmmo = player;
  let smallestDistanceFromAmmo = ourDistanceFromAmmo;

  enemies.forEach(enemy => {
    const enemyDistanceFromAmmo = calculateDistance(enemy.position, closestAmmo);
    if (enemyDistanceFromAmmo < smallestDistanceFromAmmo) {
      closestPlayerToAmmo = enemy;
      smallestDistanceFromAmmo = enemyDistanceFromAmmo;
    }
  });

  return closestPlayerToAmmo;
}

function targetClosestPlayerToAmmo(closestAmmo, player) {
  let headingDir;
  if (closestAmmo[0] - player.position[0] === 0 || closestAmmo[1] - player.position[1] === 0) {
    headingDir = calculateHeading(player.position, closestAmmo);
  } else if (Math.abs(closestAmmo[0] - player.position[0]) <  Math.abs(closestAmmo[1] - player.position[1])) {
    headingDir = calculateHeading(player.position, [closestAmmo[0], player.position[1]]);
  } else {
    headingDir = calculateHeading(player.position, [closestAmmo[1], player.position[0]]);
  }

  return turnOrMove(headingDir, player);
}

function turnOrMove(headingDir, player) {
  if (headingDir === player.direction) {
    return "move";
  } else {
    return headingDir;
  }
}

export default {
  info: {
    name: "lrbot",
    style: 20,
    team: 10,
  },
  ai: function (player, enemies, game) {
    log("Executing my AI function", player, enemies, game);

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies);
    if (player.ammo > 0 && targets.length > 0) {
      log("Found someone to shoot", targets);
      return "shoot"
    }

    // Check if we are in immediate danger, if so try to move
    if (threatsFacingMe(player, enemies).length > 0) {
      log("In danger! Lets try to move");
      if (canMoveForward(player, game) && isActionSafe(player, 'move', enemies, game)) {
        return "move";
      }
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game);

    if (closestAmmo) {
      log("Found some ammo", closestAmmo);
      const closestPlayerToAmmo = getClosestPlayerToAmmo(closestAmmo, player, enemies);
      if (closestPlayerToAmmo !== player) {
        return targetClosestPlayerToAmmo(closestAmmo, player);
      }

      const ammoDir = calculateHeading(player.position, closestAmmo);

      log("Heading towards ammo", ammoDir);
      if (ammoDir === player.direction) {
        const safe = isActionSafe(player, 'move', enemies, game)
        if (safe) return "move";
      } else {
        return ammoDir;
      }
    }

    // Nothing else to do ... lets just make a random move
    log("Bummer, found nothing interesting to do ... making random move");
    const safe = isActionSafe(player, 'move', enemies, game);
    if (safe) {
      return makeRandomMove();
    }
  },
};
