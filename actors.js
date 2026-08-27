import State from "./state.js";

//class to help us work with game co-ordinates for different actors
class Vec {
    constructor (x, y){
        this.x = x;
        this.y = y;
    }
    plus (other){
        return new Vec(this.x + other.x, this.y + other.y)
    }
    /* useful while multiplying a speed vector by a time interval to get the
    distance traveled during that time */
    times (factor){
        return new Vec(this.x * factor, this.y * factor)
    }
}

//  ACTORS - Actor objects represent the current position and state of a given moving element(player,coin or movinng lava)
/*All actors conform to the same interface
(size and pos props and an update method)
Each actor gets its own class since its behavior is distinct
*/

//Player Actor - the player class has a speed prop that stores its current speed to simulate momentum and gravity
class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    get type () {
        return 'player'
    }
    static create (pos) {
        //because a player is one-and-a-half squares high, its initial position is set to be half a square above the position where the @ character appeared. This way, its bottom aligns with the bottom of the square where it appeared
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0))
    }
}

//The size of the player is the same for all player instances, so we rather store it on the prototype
Player.prototype.size = new Vec(0.8, 1.5);

//updating player - player motion is handled based on the axis at hand
//(hitting a wall should not prevent jumping or falling motion and hitting the floor should not prevent horizontal motion)
const playerXspeed = 7;
const gravity = 30;
const jumpSpeed = 17;
Player.prototype.update = function (time, state, keys) {
    let xSpeed = 0;
    if(keys.ArrowLeft) xSpeed -= playerXspeed;
    if(keys.ArrowRight) xSpeed += playerXspeed;
    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed * time, 0));
    if(!state.level.touches(pos, this.size, 'wall')){
        pos = movedX;
    }

    //the players ySpeed is first accelerated to account for gravity(remember our cartesian plane is inverted hence the positive gravity acceleration)
    let ySpeed = this.speed.y + time * gravity;
    let movedY = pos.plus(new Vec(0, ySpeed * time));
    if(!state.level.touches(movedY, this.size, 'wall')){
        pos = movedY
    } else if (keys.ArrowUp && ySpeed > 0){
        //if we touched a wall and the yspeed is greater than 0 while the upArrow key is held, it means the wall is below us
        //so we set the ySpeed to a relatively large negative value to cause the player to jump.
        ySpeed = -jumpSpeed
    } else {
        //if the above is not the case, we know the player bumped into something and we set the yspeed to zero.
        ySpeed = 0;
    }
    return new Player(pos, new Vec(xSpeed, ySpeed));
}

//Lava Actor
class Lava {
    constructor (pos, speed, reset){
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }
    get type (){
        return 'lava'
    }
    //create method looks at the character that the Level constructor passes and creates the appropriate lava actor.
    static create (pos, ch){
        if(ch == '='){
            return new Lava(pos, new Vec(2, 0))
        } else if(ch == '|'){
            return new Lava(pos, new Vec(0, 2))
        } else if(ch == 'v'){
            return new Lava(pos, new Vec(0, 3), pos)
        }
    }
}

Lava.prototype.size = new Vec(1, 1);

Lava.prototype.collide = function(state){
    return new State(state.level, state.actors, 'lost')
}

//updating the lava actor
Lava.prototype.update = function(time, state) {
    let newPos = this.pos.plus(this.speed.times(time));
    //after a move which happens every step of the time we check whether the new position touches the wall
    //if it doesnt touch the wall, we move the Lava to the next position and if it does its direction is
    //inverted if it is horizontal moving lava while its position is reset if it is dripping lava
    if(!state.level.touches(newPos, this.size, 'wall')){
        return new Lava(newPos, this.speed, this.reset)
    } else if (this.reset) {
        return new Lava(this.reset, this.speed, this.reset)
    } else {
        return new Lava(this.pos, this.speed.times(-1))
    }
}

class Coin {
    //wobble-coin wobble motion
    constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble
    } 
    get type (){
        return 'coin'
    }
    static create (pos){
        let basePos = pos.plus(new Vec(0.2, 0.1));
        //Math.PI * 2 = period of Math.sin's wave
        return new Coin(basePos, basePos, Math.random * Math.PI * 2)
    }
}

Coin.prototype.size = new Vec(0.6, 0.6);

Coin.prototype.collide = function (state) {
    //remove the current coin
    let filtered = state.actors.filter(a => a != this)
    let status = state.status;
    //if this is the last coin set the status to 'won'
    if(!filtered.some(a => a.type == 'coin')) status = 'won'
    return new State(state.level, filtered, status)
}

//the coins update method is used to simulate wobble motion for the coin
const wobbleSpeed = 8, wobbleDist = 0.07;
Coin.prototype.update = function (time) {
    //let wobble = this.wobble + time * wobbleSpeed;
    //sin = O/H, O = sin theta * H, O is our wobblePos, with a circle center origin, O is a y-coordinate of a valid random point in a circle where wobbleDist is the radius
    //let wobblePos = Math.sin(wobble) * wobbleDist;
    //return new Coin(this.basePos.plus(new Vec(0, wobblePos)), this.basePos, wobble)
    return new Coin(this.basePos, this.basePos, Math.random * Math.PI * 2)
}

export {Lava, Coin, Player, Vec}