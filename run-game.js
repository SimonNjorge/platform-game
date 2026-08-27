import { gameLevels, Level } from "./level.js";
import DOMDisplay from "./view.js";
import State from "./state.js";
import { arrowKeys } from "./utils.js";

//Solves animating our game and updating actors based on movements and collisions using requestAnimationFrame function

/*
this function expects a time difference as an argument and draws a single frame
using requestAnimationFrame and when the frameFunc callback that is passed to it 
returns false, the animation is stopped
*/
function runAnimation (frameFunc) {
    let lastTime = null;
    function frame(time){
        if(lastTime != null){
            //the time difference might be ridiculously large when the browser tab is navigated away from
            //so we put a maximum step of 100ms and convert the steps to seconds
            let timeStep = Math.min(time - lastTime, 100) / 1000;
            if(frameFunc(timeStep) === false) return;
        }
        lastTime = time;
        requestAnimationFrame((newTime) => frame(newTime))
    }
    requestAnimationFrame((newTime) => frame(newTime))
}

function runLevel (level, Display) {
    //remove the current game layout if any is present
    let currentGameDom = document.querySelector('.game');
    const gameDOMCont = document.getElementById('game-cont');
    if(currentGameDom) currentGameDom.remove();
    let display = new Display(gameDOMCont, level);
    let state = State.start(level);
    /*when the level is finished (lost or won),
    runLevel waits two more second (to let the user see what happens) and
    then clears the display, stops the animation, and resolves the promise
    to the games end status.*/
    let ending = 2;

    return new Promise(resolve => {
        runAnimation(time => {
            state = state.update(time, arrowKeys);
            display.syncState(state);
            if(state.status == 'playing'){
                return true
            } else if (ending > 0) {
                ending -= time;
                return true;
            } else {
                display.clear();
                resolve(state.status);
                return false;
            }
        })
    })
}

let status = document.getElementById('status');
let restart = document.getElementById('restart');

//in this runGame function, whenever the player dies, the current level is restarted and when 
//a level is completed, we advance to the next level
async function runGame(plans, Display) {
    status.innerHTML = '';
    restart.innerText = 'restart level';
    //restart.style.display = 'none';
    let lvl = JSON.parse(localStorage.getItem('level')) || 0;
    for(let level = lvl; level < plans.length; ){
        localStorage.setItem('level', JSON.stringify(level))
        let status = await runLevel(new Level(plans[level]), Display);
        if (status == 'won') level++ 
    }
    localStorage.removeItem('level');
    status.innerHTML = `
       You Won
    `
    restart.innerText = 'reset game';
    //restart.style.display = 'inline'
    //console.log("You won")
}

runGame(gameLevels, DOMDisplay);

restart.addEventListener('click', () => {
    runGame(gameLevels, DOMDisplay)
});
