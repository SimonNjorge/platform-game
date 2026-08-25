//First Part solves creating a level instance

//Layout representation
/*
Periods - empty space,
hash (#) characters - walls, 
plus - lava,
@ - player’s starting position,
O -  coin,  
(=) - block of lava that moves back and forth horizontally.
(|) - vertically moving lava, 
v - dripping lava,
*/
let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

//  ACTORS - Actor objects represent the current position and state of a given moving element(player,coin or movinng lava)
/*All actors conform to the same interface
(size and pos props and an update method)
*/

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


//Each actor gets its own class since its behavior is distinct

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

/*Reading a level - a level object that takes the level plan string
key things: separating the background from moving elements
            the bg is an array of arrays of strings holding field types such as
            'empty', 'wall' or 'lava'
            The mapping on the rows helps us get the x and y co-ordinates of a given 
            character.
            LevelChars object helps interpret the characters in the level plan
            where if a char is a string it represents a bg and if its a class it represents an actor.
            Positions are stored in pairs, with (0, 0) being the upper left corner,
            each bg square is 1 unit wide and 1 unit high.
*/
class Level {
    constructor (plan) {
        let rows = plan.trim().split("\n").map(l => [...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        //console.log(rows)
        this.rows = rows.map((row, y) => {
            return row.map((ch, x) => {
                let type = levelChars[ch];
                //if type is an actor class, its static create method is used to create an object, which is added to startActors, and the mapping function returns "empty" for this background square.
                if(typeof type !== 'string'){
                    let pos = new Vec(x, y);
                    this.startActors.push(type.create(pos, ch));
                    type = "empty";
                }
                return type;
            })
        })
    }
}

//levelChar object - maps plan characters to either background grid types or actor classes
const levelChars = {
    ".": "empty", "#": "wall", "+": "lava",
    "@": Player, "o": Coin,
    "=": Lava, "|": Lava, "v": Lava
};


//console.log(new Level(simpleLevelPlan).rows)
//This state class will help track the state of a running game
class State {
    constructor(level, actors, status) {
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

//THE 2ND PART SOLVES DISPLAYING LEVELS ON A SCREEN AND MODELLING TIME AND MOTION.

//helper function to create an element, pass it some attributes and child nodes
//uses rest parameter to spread the children args into an array
function elt (name, attrs, ...children){
    let dom = document.createElement(name)
    for(let attr of Object.keys(attrs)){
        dom.setAttribute(attr, attrs[attr])
    }
    for(let child of children){
        dom.appendChild(child)
    }
    return dom;
}

class DOMDisplay {
    constructor (parent, level){
        this.dom = elt('div', {class: 'game'}, drawGrid(level));
        //used to track the element that holds the actors, so that they can easily be removed or replaced
        this.actorLayer = null;
        parent.appendChild(this.dom)
    }
    clear(){
        this.dom.remove()
    }
}

//function to draw the grid
//used to scale our grid units to pixels 
const scale = 20;
function drawGrid (level) {
    return elt('table', 
        {
            class: 'background',
            style: `width: ${level.width * scale}px`
        },
        ...level.rows.map(row => {
            return elt('tr', {style: `height: ${scale}px`},
                ...row.map(type => elt('td', {class: type}))
            )
        })
    )
}

//Drawing Actors
function drawActors (actors) {
    return elt('div', {}, ...actors.map(actor => {
        let rect = elt('div', {class: `actor ${actor.type}`});
        rect.style.width = `${actor.size.x * scale}px`;
        rect.style.height = `${actor.size.y * scale}px`;
        rect.style.top = `${actor.pos.y * scale}px`;
        rect.style.left = `${actor.pos.x * scale}px`;
        return rect;
    }))
}

DOMDisplay.prototype.syncState = function (state) {
    if(this.actorLayer) this.actorLayer.remove();
    this.actorLayer = drawActors(state.actors);
    //this.dom holds the drawn grids, the drawn actors are absolutely positioned
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
}

DOMDisplay.prototype.scrollPlayerIntoView = function (state){
    console.log('hello')
}

let simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel.width, 'by', simpleLevel.height)
const display = new DOMDisplay(document.body, simpleLevel);
display.syncState(State.start(simpleLevel))