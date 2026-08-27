//This state class will help track the state of a running game
class State {
    constructor (level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }
    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    get player() {
        return this.actors.find(a => a.type == "player");
    }
}

//checking for overlaps btw two actors; actors only overlap if their coordinates overlap on both x and y axis
function overlap (actor1, actor2) {
    return actor1.pos.x + actor1.size.x > actor2.pos.x &&
        actor2.pos.x + actor2.size.x > actor1.pos.x &&
        actor1.pos.y + actor1.size.y  > actor2.pos.y &&
        actor2.pos.y + actor2.size.y > actor1.pos.y   
}

//The state update method uses the 'touches' Level method to figure out whether the player is touching lava.
//this method is passed a time step and a data structure that tells it the keys that are currently held
State.prototype.update = function (time, keys){
    let actors = this.actors.map(actor => actor.update(time, this, keys));
    let newState = new State(this.level, actors, this.status)
    
    //if the game is already over we return that state
    if(newState.status != 'playing') return newState;
    //console.log(newState.status)
    //if the player is touching bg lava we end the game
    let player = newState.player;
    if(this.level.touches(player.pos, player.size, 'lava')){
        return new State(this.level, actors, 'lost')
    };

    //if the game is really still going on we check whether any other actors overlap the player
    //whereby if any actor does overlap its collide method gets a chance to update the state
    for(let actor of actors){
        if(actor.type != 'player' && overlap(actor, player)){
            newState = actor.collide(newState)
        }
    }
    return newState
}

export default State;