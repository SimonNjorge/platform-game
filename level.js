import { levelChars } from "./utils.js";
import { Vec } from "./actors.js";

//Solves creating a level instance

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
..#...............v#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

const gameLevels = [
    `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`, 
 `
......................
..#................#..
..#.o............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`

]

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

/*this method checks whether a rectangle, specified by a position and a size touches a grid element of the given type*/
Level.prototype.touches = function (pos, size, type) {
    //we round the co-ordinates of the elts position up and down to get a range of all the bg grids it touches
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);
    //we loop over the grid squares in our range and return true if we find one matching the type given. Grids outside the level are treated as walls
    for(let x = xStart; x < xEnd; x++){
        for(let y = yStart; y < yEnd; y++){
            let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
            //assigning the type of a grid square of given co-ordinates 
            let here = isOutside ? 'wall' : this.rows[y][x]
            if(type == here) return true;
        }
    }
    //if we dont return inside the loops the given rectangle does not touch the type
   return false
}

export {gameLevels, Level}