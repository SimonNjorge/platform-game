import { Lava, Player, Coin } from "./actors.js";

//levelChar object - maps plan characters to either background grid types or actor classes
const levelChars = {
    ".": "empty", "#": "wall", "+": "lava",
    "@": Player, "o": Coin,
    "=": Lava, "|": Lava, "v": Lava
};

//touch screen controls
let up = document.getElementById('up');
let left = document.getElementById('left');
let right = document.getElementById('right');

//TRACKING KEYS 
/*we want player movement to always update as long as the keys are held not just when a key is pressed*/
function trackKeys (keys) {
    const down = Object.create(null);
    function track (event){
        event.preventDefault()
        if(keys.includes(event.key)){
            //when the tracked key is pressed we want to return true for it, otherwise false 
            down[event.key] = event.type == 'keydown'
        }
    }

    //tracking keys for touch screens
    up.addEventListener("touchstart", () => {
        down.ArrowUp = true;
    })
    up.addEventListener("touchend", () => {
        down.ArrowUp = false;
    })
    left.addEventListener("touchstart", () => {
        down.ArrowLeft = true;
    })
    left.addEventListener("touchend", () => {
        down.ArrowLeft = false;
    })
    right.addEventListener("touchstart", () => {
        down.ArrowRight = true;
    })
    right.addEventListener("touchend", () => {
        down.ArrowRight = false;
    })

    //we register the same handler for keydown and keyup events
    window.addEventListener('keydown', track);
    window.addEventListener('keyup', track);

    return down;
}

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"])

export { levelChars, arrowKeys}