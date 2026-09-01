//SOLVES DISPLAYING LEVELS ON A SCREEN.

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

DOMDisplay.prototype.syncState = function (state) {
    if(this.actorLayer) this.actorLayer.remove();
    //when we sync our state, we redraw all the actors, and since there are only a handful of them
    //this is not that expensive. Another alternative would be to reuse the DOM elements but that would require additional 
    //bookkeeping to associate each actor with their DOM elts and making sure to remove the DOM elts when an actor vanishes.
    this.actorLayer = drawActors(state.actors);
    //this.dom holds the drawn grids, the drawn actors are absolutely positioned relative to the outer (.game class) container
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
}

//this ensures if a level is protruding outside the viewport, we scroll the viewport to make sure the player is near its center.
DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
    //console.log('hello')
    let height = this.dom.clientHeight;
    let width = this.dom.clientWidth;
    let margin = width / 3;

    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;
    //console.log(left, top, right, bottom)
    let player = state.player;
    //the co-ordinates of an actor's center
    let center = player.pos.plus(player.size.times(0.5)).times(scale);
    //this.dom.scrollLeft = 3000
    if (center.x < left + margin) {
        this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
        this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
        this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
        this.dom.scrollTop = center.y + margin - height;
    }
}

export default DOMDisplay;
