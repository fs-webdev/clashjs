import {
  makeRandomMove,
  calculateHeading,
  findClosestAmmo,
  threatsFacingMe,
  canMoveForward,
  enemiesInRange,
  isActionSafe
} from "../lib/helpers";

/*
Improvements:
how fast bullets move? 
  Entire row instantly at players position
Better determine when to shoot people? 
  Can we track position of other players?
    Enemies have direction, position, and ammo
Does shooting take up a movement turn? [5]
Can we turn the ship without moving it? [5]
Is action safe? [1][x]
*/


/*
  Enemies object

  [
   {
      "style":103,
      "position":[
         0,
         4
      ],
      "direction":"east",
      "ammo":0,
      "isAlive":true,
      "id":"PCD0UV32",
      "name":"random"
   },
   {
      "style":25,
      "position":[
         2,
         6
      ],
      "direction":"west",
      "ammo":0,
      "isAlive":true,
      "id":"9PZZ1S52",
      "name":"TestBot"
   }
]
*/

/* Game 
  {
   "gridSize":7,
   "ammoPosition":[

   ],
   "cargos":[

   ],
   "asteroids":[

   ]
}
*/

/* player
  {
   "style":20,
   "position":[
      6,
      6
   ],
   "direction":"west",
   "ammo":0,
   "isAlive":true,
   "id":"KINILKXV",
   "name":"starterbot"
}
*/

import debug from "debug";
const log = debug("clashjs:bot:starterbot");
var futureAction;

export default {
  info: {
    name: "fuzzypuppy",
    style: 110,
    team: 4,
  },
  ai: function (player, enemies, game) {
    log("Executing my AI function", player, enemies, game);

    function checkForDanger(){
      if(isActionSafe(player, futureAction, enemies, game)){
        return futureAction;
      }else{
        return '';
      }
    }

    // Check if we are in immediate danger, if so try to move
    // check up down left right
    if (threatsFacingMe(player, enemies).length > 0) {
      log("In danger! Lets try to move");
      // move where? calculate up down left right best position
      if (canMoveForward(player, game)&&(isActionSafe(player, "move", enemies, game))) {
        return "move";
      }else{
        //I cannot escape danger try to shoot instead
        const targets = enemiesInRange(player, enemies);
        if (player.ammo > 0 && targets.length > 0) {
          log("Found someone to shoot", targets);
          return "shoot";
        }else{
          //I cannot shoot anyone, time to pray
          return makeRandomMove();
        }
      }
    }

    function getPlayerNextTile(player){
      if(player.direction === 'north'){
        return [player.position[0]+1,player.position[1]]
      }
      if(player.direction === 'south'){
        return [player.position[0]-1,player.position[1]]
      }
      if(player.direction === 'east'){
        return [player.position[0],player.position[1]+1]
      }
      if(player.direction === 'west'){
        return [player.position[0],player.position[1]-1]
      }
    }

    function calculateClosestSafeZone(){
        const myPosition = player.position;
        const myDirection = player.direction;
        const nextTile = getPlayerNextTile(player);
        // loop through enemies, how in 1 turn how many enemies could be facing that tile?
        let potentialDanger = 0;
        for(let enemy of enemies){

          if(enemy.position[0] < nextTile[0] && enemy.direction === 'south' ){
            potentialDanger++
          }
          if(enemy.position[0] > nextTile[0] && enemy.direction === 'north' ){
            potentialDanger++
          }
          if(enemy.position[1] < nextTile[1] && enemy.direction === 'west'){
            potentialDanger++
          }
          if(enemy.position[1] > nextTile[1] && enemy.direction === 'east'){
            potentialDanger++
          }
        }
        if(potentialDanger > 0){
          console.log('figured')
          return 'west'
        }
    }   
    //calculateClosestSafeZone()
/*
    // Move to edges and corners to minimize vulnerable angles
    var farEdge = (game.gridSize)-1; //integer
    var myPosition = player.position; //[x,y]
    var closestEdge; //north, east, south, west
    var fourDirections =[myPosition[0], myPosition[1]-farEdge, myPosition[0]-farEdge, myPosition[1]];
    var direction = 0; //North, East, South, West
    for (var i = 1; i < fourDirections.length; i++) {
      if (fourDirections[i] < fourDirections[lowest]) lowest = i;
    }
    switch(direction){
      case 0: closestEdge = "north";
      case 1: closestEdge = "east";
      case 2: closestEdge = "south";
      default: closestEdge = "west";
    }
    
*/
    

    

    // Not in danger, so lets see if we can shoot somebody
    const targets = enemiesInRange(player, enemies);
    if (player.ammo > 0 && targets.length > 0) {
      log("Found someone to shoot", targets);
      futureAction = "shoot";
      checkForDanger();
    }

    // Not in danger, nobody to shoot, lets go collect more ammo
    const closestAmmo = findClosestAmmo(player, game);

    if (closestAmmo) {
      log("Found some ammo", closestAmmo);
      const ammoDir = calculateHeading(player.position, closestAmmo);

      log("Heading towards ammo", ammoDir);
      if (ammoDir === player.direction) {
        futureAction = "move";
        checkForDanger();
      } else {
        return ammoDir;
      }
    }
      
    // Nothing else to do ... lets just make a random move
    log("Bummer, found nothing interesting to do ... making random move");
    return makeRandomMove();
  },
};
