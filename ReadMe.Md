**Repo contains code for a simple platform game**

Directory Layout: 
Root - /platform-game

|_______  ./actors.js - Handles   actor classes and their implementation

|_______ ./state.js - Helps keep track of game state; actors, status(won/lost).

|_______ ./view.js - Draws, game structure using the level plan, actors in their respective positions(when the game starts and when its playing).

|______ ./utils.js - Holds: utility function to help track the controller keys state, an object to interpret each character in a level plan.

|______ ./level.js - holds: level plans, A Level class that reads a level plan and builds the actors assigning them their props(position etc) using the Actor classes.

|______ ./run-game.js - Implements a running game. Utilises requestAnimationFrame built in JavaScript function to animate the game using the State class update method to update actors per time frame and the DOMDisplay class syncState method to redraw the updated actors.
